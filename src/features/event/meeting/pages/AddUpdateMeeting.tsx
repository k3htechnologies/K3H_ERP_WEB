import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';

import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { isValidEmail, isValidMobile } from '@/core/utils/fileValidation';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';

import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import Stepper, { type StepperStep } from '@/ui/components/Stepper/Stepper';

import type { AddUpdateEventRequest } from '@/features/event/event/models/EventModel';

import type {
  AddUpdateConferenceDetailsRequest,
  ConferenceRoomData,
} from '@/features/event/conference/models/ConferenceModel';
import type {
  AddUpdateMOMDocumentsRequest,
  AgendaData,
  AgendaStatus,
  DeleteMeetingMasterRequest,
  MeetingAgenda,
  MeetingMetadata,
} from '@/features/event/meeting/models/MeetingModel';

import {
  DEFAULT_UNIQUE_KEY,
  buildMeetingMasterRequest,
  getMeetingDetailRequest,
  getMeetingDocumentUrlGroups,
  getInitialMeetingForm,
  getInitialMeetingMetadata,
  mapEventToMeetingForm,
  mapMeetingMasterToEventData,
  parseMeetingMetadata,
} from '@/features/event/meeting/utils/MeetingUtils';

import MeetingDetailsSection, {
  type MeetingDetailsErrors,
} from '@/features/event/meeting/components/MeetingDetailsSection';

import MeetingAgendaSection from '@/features/event/meeting/components/MeetingAgendaSection';
import MeetingAttachmentsSection from '@/features/event/meeting/components/MeetingAttachmentsSection';

import { ConferenceService } from '@/features/event/conference/services/ConferenceService';
import { MeetingService } from '@/features/event/meeting/services/MeetingService';

const getApiMessage = (
  messages: string[] | undefined,
  fallback: string,
): string => messages?.filter(Boolean).join(', ') || fallback;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unexpected error occurred';

const getSavedMeetingIdentity = (
  data: unknown,
  fallbackUniqueKey: string,
) => {
  const savedData = Array.isArray(data) ? data[0] : data;

  if (typeof savedData === 'number' || typeof savedData === 'string') {
    const id = Number(savedData);
    return {
      meetingId: Number.isFinite(id) && id > 0 ? id : 0,
      uniqueKey: fallbackUniqueKey,
    };
  }

  if (savedData && typeof savedData === 'object') {
    const record = savedData as Record<string, unknown>;
    const id = Number(record.MeetingId ?? record.meetingId ?? 0);

    if ((!Number.isFinite(id) || id <= 0) && (record.Data || record.data)) {
      return getSavedMeetingIdentity(
        record.Data ?? record.data,
        fallbackUniqueKey,
      );
    }

    return {
      meetingId: Number.isFinite(id) && id > 0 ? id : 0,
      uniqueKey: String(
        record.UniqueKey ??
        record.Uniquekey ??
        record.uniqueKey ??
        record.uniquekey ??
        fallbackUniqueKey,
      ),
    };
  }

  return { meetingId: 0, uniqueKey: fallbackUniqueKey };
};

const getSavedConferenceId = (data: unknown, fallbackId = 0): number => {
  const savedData = Array.isArray(data) ? data[0] : data;

  if (typeof savedData === 'number' || typeof savedData === 'string') {
    const id = Number(savedData);
    return Number.isFinite(id) && id > 0 ? id : fallbackId;
  }

  if (savedData && typeof savedData === 'object') {
    const record = savedData as Record<string, unknown>;
    const id = Number(
      record.ConferenceRoomBookingId ??
      record.conferenceRoomBookingId ??
      record.ConferenceId ??
      record.conferenceId ??
      record.Id ??
      record.id ??
      0,
    );

    return Number.isFinite(id) && id > 0 ? id : fallbackId;
  }

  return fallbackId;
};

const getConferenceRoomId = (roomValue?: string): number => {
  const numericValue = Number(roomValue);
  if (Number.isInteger(numericValue) && numericValue > 0) return numericValue;

  const roomNumber = String(roomValue || '').match(/\d+/)?.[0];
  return roomNumber ? Number(roomNumber) : 0;
};

const normalizeApiTime = (value?: string): string => {
  const time = value?.trim() || '';
  return /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
};

const mapAgendaDataToMeetingAgenda = (agenda: AgendaData): MeetingAgenda => ({
  AgendaId: agenda.AgendaId,
  UniqueKey: agenda.UniqueKey || DEFAULT_UNIQUE_KEY,
  Title: agenda.AgendaTitle || '',
  Description: agenda.AgendaDescription || '',
  CreatedBy: agenda.CreatedBy || '--',
  ResponsiblePersonId: String(agenda.ResponsiblePersonId || ''),
  ResponsiblePerson: agenda.ResponsiblePersonName || agenda.ResponsiblePerson || '--',
  Priority: 'Medium',
  Status: (agenda.AgendaStatus || 'Pending') as AgendaStatus,
  Remark: agenda.Remark || '',
  Discussion: agenda.Discussion || '',
  Conclusion: agenda.AgendaConclusion || '',
  DocumentUrl: agenda.DocumentURLs || '',
  MeetingTitle: agenda.MeetingTitle || 'Previous Meeting',
  MeetingDate: agenda.MeetingDate || '',
});

const MEETING_STEPS = [
  { id: 'meeting-details', label: 'Meeting Details', icon: 1 },
  { id: 'agendas', label: 'Agendas', icon: 2 },
  { id: 'documents', label: 'Documents', icon: 3 },
] as const satisfies readonly StepperStep[];

type MeetingStepId = (typeof MEETING_STEPS)[number]['id'];

export const AddUpdateMeeting: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateEventRequest>(() => getInitialMeetingForm());
  const [metadata, setMetadata] = useState<MeetingMetadata>(() => getInitialMeetingMetadata());
  const [errors, setErrors] = useState<MeetingDetailsErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeStep, setActiveStep] = useState<MeetingStepId>('meeting-details');

  // DOCUMENT STATE
  const [momDocuments, setMomDocuments] = useState<File[]>([]);
  const [presentationDocuments, setPresentationDocuments] = useState<File[]>([]);
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [existingDocumentUrls, setExistingDocumentUrls] = useState({
    presentation: [] as string[],
    mom: [] as string[],
    supporting: [] as string[],
  });
  const [removedDocumentUrls, setRemovedDocumentUrls] = useState({
    presentation: [] as string[],
    mom: [] as string[],
    supporting: [] as string[],
  });

  // CANCEL MEETING STATE
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [hasSavedMeetingDetails, setHasSavedMeetingDetails] = useState(false);
  const [conferenceBookingId, setConferenceBookingId] = useState(0);
  const [conferenceBookingUniqueKey, setConferenceBookingUniqueKey] = useState('');
  const [isConferenceCancelDialogOpen, setIsConferenceCancelDialogOpen] = useState(false);
  const [isCancellingConference, setIsCancellingConference] = useState(false);
  const [conferenceRoomOptions, setConferenceRoomOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingConferenceRooms, setIsLoadingConferenceRooms] = useState(false);

  // USE NAVIGATE | LOCATION | PARAMS
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams<{ eventId?: string }>();
  const eventIdNumber = Number(eventId);

  // PAGE MODE
  const isMomMode =
    location.state?.mode === 'mom' ||
    location.pathname.toLowerCase().endsWith('/mom');
  const isEditMode = location.pathname.includes('/edit/') && !isMomMode;

  // TOAST
  const { addToast } = useToast();

  // MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/event');

  // DROPDOWN STATE
  const employeeDropdown = useMultiSelectDropdown({
    value: formData.EmployeeId,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  const departmentDropdown = useMultiSelectDropdown({
    value: formData.DepartmentId,
    fetchCallback: fetchDepartmentMasterDropdown,
    autoFetchOptions: true,
  });

  const loadConferenceRooms = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingConferenceRooms(true);

    const response = await ConferenceService.apiCallPullConferenceDetails(
      {
        PageSize: 10,
        PageNumber: 1,
        RoomId: 0,
      },
      { signal },
    );

    if (signal?.aborted) return;

    if (E.isRight(response) && response.right.IsSuccess) {
      const rooms = Array.isArray(response.right.Data)
        ? response.right.Data
        : [];

      setConferenceRoomOptions(
        rooms.map((room: ConferenceRoomData) => ({
          label: room.RoomName,
          value: String(room.ConferenceRoomId),
        })),
      );
    } else {
      setConferenceRoomOptions([]);
      addToast({
        type: 'error',
        title: E.isLeft(response)
          ? response.left.message
          : getApiMessage(response.right.ErrorMessage, 'Unable to load conference rooms'),
      });
    }

    setIsLoadingConferenceRooms(false);
  }, [addToast]);

  const pullConferenceBooking = async (meetingId: number, bookingId = 0) => {
    const response = await ConferenceService.apiCallPullConferenceBookingDetails({
      PageSize: 10,
      PageNumber: 1,
      SortBy: '',
      ...(bookingId > 0
        ? { ConferenceRoomBookingId: bookingId }
        : { MeetingId: meetingId }),
    });

    if (E.isLeft(response) || !response.right.IsSuccess) {
      addToast({
        type: 'error',
        title: E.isLeft(response)
          ? response.left.message
          : getApiMessage(
              response.right.ErrorMessage,
              'Unable to load conference booking details',
            ),
      });
      return null;
    }

    const bookings = Array.isArray(response.right.Data)
      ? response.right.Data
      : [];
    const booking =
      (bookingId > 0
        ? bookings.find(
            (item) => item.ConferenceRoomBookingId === bookingId,
          )
        : bookings.find((item) => item.MeetingId === meetingId)) ??
      bookings[0] ??
      null;

    if (booking) {
      setConferenceBookingId(booking.ConferenceRoomBookingId);
      setConferenceBookingUniqueKey(booking.UniqueKey || '');
    }

    return booking;
  };

  // STEPPER STATE
  const visibleMeetingSteps = isMomMode
    ? MEETING_STEPS.filter((step) => step.id === 'agendas')
    : MEETING_STEPS;

  const activeStepIndex = visibleMeetingSteps.findIndex((step) => step.id === activeStep);
  const isLastStep = activeStepIndex === visibleMeetingSteps.length - 1;
  //#endregion

  //#region INIT
  useEffect(() => {
    if (metadata.MeetingMode !== 'Physical') return;

    const controller = new AbortController();
    void loadConferenceRooms(controller.signal);

    return () => controller.abort();
  }, [metadata.MeetingMode, loadConferenceRooms]);

  useEffect(() => {
    if (metadata.MeetingMode !== 'Physical' || conferenceRoomOptions.length === 0) return;

    setFormData((current) => {
      const roomValue = String(current.Room || '').trim();
      if (!roomValue) return current;
      if (conferenceRoomOptions.some((option) => String(option.value) === roomValue)) {
        return current;
      }

      const matchingRoom = conferenceRoomOptions.find(
        (option) => option.label.trim().toLowerCase() === roomValue.toLowerCase(),
      );

      return matchingRoom ? { ...current, Room: matchingRoom.value } : current;
    });
  }, [conferenceRoomOptions, metadata.MeetingMode]);

  useEffect(() => {
    if (isMomMode) {
      setActiveStep('agendas');
      void loadMomDetails();
      return;
    }

    if (isEditMode) {
      setActiveStep('meeting-details');
      void fetchMeetingDetails();
      return;
    }

    setActiveStep('meeting-details');
    setFormData(getInitialMeetingForm());
    setMetadata(getInitialMeetingMetadata());
    setExistingDocumentUrls({
      presentation: [],
      mom: [],
      supporting: [],
    });
    setMomDocuments([]);
    setPresentationDocuments([]);
    setSupportingDocuments([]);
    setConferenceBookingId(0);
    setConferenceBookingUniqueKey('');
    setRemovedDocumentUrls({ presentation: [], mom: [], supporting: [] });
  }, [eventId, isEditMode, isMomMode]);
  //#endregion

  //#region FORM FIELD CHANGE
  const handleFieldChange = (
    field: keyof AddUpdateEventRequest,
    value: AddUpdateEventRequest[keyof AddUpdateEventRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasSavedMeetingDetails(false);

    switch (field) {
      case 'Title':
      case 'Date':
      case 'StartTime':
      case 'EndTime':
      case 'Room':
      case 'DepartmentId':
      case 'EmployeeId':
        setErrors((prev) => ({ ...prev, [field]: '' }));
        break;
      default:
        break;
    }
  };

  const handleMetadataChange = <K extends keyof MeetingMetadata>(
    field: K,
    value: MeetingMetadata[K],
  ) => {
    if (
      field === 'MeetingMode' &&
      value === 'Online' &&
      isEditMode &&
      metadata.MeetingMode === 'Physical'
    ) {
      setIsConferenceCancelDialogOpen(true);
      return false;
    }

    setMetadata((prev) => ({ ...prev, [field]: value }));
    setHasSavedMeetingDetails(false);

    if (field === 'ExternalParticipantDetails') {
      setErrors((prev) => ({ ...prev, ExternalParticipantDetails: {} }));
    }

    return true;
  };
  //#endregion

  //#region DATA LOADING | FETCH | LOAD MOM | AGENDA
  const loadMomDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const meetingRequest = getMeetingDetailRequest(eventIdNumber);

        const [meetingResponse, agendaResponse] = await Promise.all([
          MeetingService.apiCallPullMeetingMaster(meetingRequest),
          MeetingService.apiCallPullPreviousAgendaDetails({
            PageSize: 1000,
            PageNumber: 1,
            meetingId: eventIdNumber,
          }),
        ]);

        let nextMetadata = getInitialMeetingMetadata();

        if (E.isRight(meetingResponse)) {
          if (meetingResponse.right.IsSuccess) {
            const meeting = Array.isArray(meetingResponse.right.Data)
              ? meetingResponse.right.Data.find((item) => item.MeetingId === eventIdNumber) ??
                meetingResponse.right.Data[0]
              : undefined;

            if (meeting) {
              const eventMeeting = mapMeetingMasterToEventData(meeting);
              const prefilledForm = mapEventToMeetingForm(eventMeeting);

              nextMetadata = parseMeetingMetadata(eventMeeting.Description);
              setFormData(prefilledForm);
              setExistingDocumentUrls(getMeetingDocumentUrlGroups(meeting));
              setConferenceBookingId(
                Number(meeting.ConferenceRoomBookingId ?? meeting.ConferenceId ?? 0),
              );
            } else {
              addToast({ type: 'error', title: 'Meeting not found' });
            }
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(
                meetingResponse.right.ErrorMessage,
                'Unable to load MOM details',
              ),
            });
          }
        } else {
          addToast({ type: 'error', title: meetingResponse.left.message });
        }

        if (E.isRight(agendaResponse)) {
          if (agendaResponse.right.IsSuccess) {
            const agendaData = Array.isArray(agendaResponse.right.Data)
              ? agendaResponse.right.Data
              : [];

            nextMetadata = {
              ...nextMetadata,
              Agendas: agendaData.map(mapAgendaDataToMeetingAgenda),
            };
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(
                agendaResponse.right.ErrorMessage,
                'Unable to load agendas',
              ),
            });
          }
        } else {
          addToast({ type: 'error', title: agendaResponse.left.message });
        }

        setMetadata(nextMetadata);
        return meetingResponse;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      'Loading MOM',
    );
  };

  const fetchMeetingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const request = getMeetingDetailRequest(eventIdNumber);
        const response = await MeetingService.apiCallPullMeetingMaster(request);

        if (E.isRight(response)) {
          if (response.right.IsSuccess) {
            const meeting = Array.isArray(response.right.Data)
              ? response.right.Data.find((item) => item.MeetingId === eventIdNumber) ??
                response.right.Data[0]
              : undefined;

            if (meeting) {
              const eventMeeting = mapMeetingMasterToEventData(meeting);
              const prefilledForm = mapEventToMeetingForm(eventMeeting);
              const prefilledMetadata = parseMeetingMetadata(eventMeeting.Description);
              const bookingId = Number(
                meeting.ConferenceRoomBookingId ?? 0,
              );

              setFormData(prefilledForm);
              setMetadata(prefilledMetadata);
              setExistingDocumentUrls(getMeetingDocumentUrlGroups(meeting));
              setConferenceBookingId(bookingId);
              setConferenceBookingUniqueKey('');

              if (
                prefilledMetadata.MeetingMode === 'Physical' ||
                bookingId > 0
              ) {
                await pullConferenceBooking(meeting.MeetingId, bookingId);
              }
            } else {
              addToast({
                type: 'error',
                title: getApiMessage(response.right.ErrorMessage, 'Meeting not found'),
              });
              navigate('/meeting', { replace: true });
            }
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(response.right.ErrorMessage, 'Meeting not found'),
            });
            navigate('/meeting', { replace: true });
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
          navigate('/meeting', { replace: true });
        }

        return response;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      'Loading Meeting',
    );
  };
  //#endregion

  //#region VALIDATION FUNCTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateMeetingForm = (): {
    isValid: boolean;
    errors: MeetingDetailsErrors;
  } => {
    const newErrors: MeetingDetailsErrors = {};

    if (!formData.Title?.trim()) {
      newErrors.Title = 'Meeting subject is required';
    }

    if (!formData.Date) {
      newErrors.Date = 'Meeting date is required';
    }

    if (!formData.StartTime) {
      newErrors.StartTime = 'Start time is required';
    }

    if (!formData.EndTime) {
      newErrors.EndTime = 'End time is required';
    } else if (formData.StartTime && formData.EndTime <= formData.StartTime) {
      newErrors.EndTime = 'End time must be after start time';
    }

    if (!formData.Room) {
      newErrors.Room = metadata.MeetingMode === 'Online'
        ? 'Meeting link is required'
        : 'Meeting location is required';
    }

    if (
      metadata.MeetingType === 'Department' &&
      departmentDropdown.selectedValues.length === 0
    ) {
      newErrors.DepartmentId = 'Department is required';
    }

    if (
      metadata.MeetingType === 'Employees' &&
      employeeDropdown.selectedValues.length === 0
    ) {
      newErrors.EmployeeId = 'At least one employee is required';
    }

    if (metadata.MeetingType === 'External Participant') {
      const participant = metadata.ExternalParticipantDetails;
      const participantErrors: NonNullable<
        MeetingDetailsErrors['ExternalParticipantDetails']
      > = {};

      if (!participant.ParticipantName.trim()) {
        participantErrors.ParticipantName = 'Participant name is required';
      }

      if (
        participant.MobileNumber.trim() &&
        !isValidMobile(participant.MobileNumber)
      ) {
        participantErrors.MobileNumber = 'Enter a valid mobile number';
      }

      if (participant.Email.trim() && !isValidEmail(participant.Email)) {
        participantErrors.Email = 'Enter a valid e-mail';
      }

      if (Object.keys(participantErrors).length > 0) {
        newErrors.ExternalParticipantDetails = participantErrors;
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  //#endregion

  //#region ADD | UPDATE MEETING MASTER
  const saveMeeting = async (navigateAfterSave = true): Promise<boolean> => {
    const validation = validateMeetingForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      setActiveStep('meeting-details');
      return false;
    }

    let isSaved = false;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const clientRegistrationId = Number(
          LocalStorageHelper.getStoredEmployeeData()?.ClientRegistrationId ?? 0,
        );

        const isPhysicalMeeting = metadata.MeetingMode === 'Physical';
        const roomId = isPhysicalMeeting ? getConferenceRoomId(formData.Room) : 0;

        if (isPhysicalMeeting && roomId <= 0) {
          addToast({
            type: 'error',
            title: 'Selected conference room is invalid.',
          });
          return;
        }

        setLoadingMessage(isEditMode ? 'Updating Meeting' : 'Scheduling Meeting');

        const meetingResponse = await MeetingService.apiCallAddUpdateMeetingMaster(
          buildMeetingMasterRequest(
            formData,
            metadata,
            employeeDropdown.selectedValues,
            clientRegistrationId,
            isPhysicalMeeting ? conferenceBookingId : 0,
          ),
        );

        if (E.isLeft(meetingResponse)) {
          addToast({ type: 'error', title: meetingResponse.left.message });
          return meetingResponse;
        }

        if (!meetingResponse.right.IsSuccess) {
          addToast({
            type: 'error',
            title: getApiMessage(meetingResponse.right.ErrorMessage, 'Unable to save meeting'),
          });
          return meetingResponse;
        }

        const savedIdentity = getSavedMeetingIdentity(
          meetingResponse.right.Data,
          formData.Uniquekey || DEFAULT_UNIQUE_KEY,
        );

        if (savedIdentity.meetingId <= 0) {
          addToast({
            type: 'error',
            title: 'Meeting saved, but MeetingId was not returned.',
          });
          return meetingResponse;
        }

        setFormData((prev) => ({
          ...prev,
          EventId: savedIdentity.meetingId,
          Uniquekey: savedIdentity.uniqueKey || prev.Uniquekey,
        }));

        let successMessage = getApiMessage(
          meetingResponse.right.SuccessMessage,
          isEditMode ? 'Meeting updated successfully' : 'Meeting saved successfully',
        );

        if (isPhysicalMeeting) {
          const conferenceRequest: AddUpdateConferenceDetailsRequest = {
            ConferenceRoomBookingId: conferenceBookingId,
            UniqueKey: DEFAULT_UNIQUE_KEY,
            RoomId: roomId,
            MeetingDate: formData.Date
              ? `${formData.Date.slice(0, 10)}T00:00:00.000Z`
              : '',
            StartTime: normalizeApiTime(formData.StartTime),
            EndTime: normalizeApiTime(formData.EndTime),
            MeetingId: savedIdentity.meetingId,
            BookingStatus: 'Booked',
          };

          setLoadingMessage('Booking Conference Room');

          const conferenceResponse =
            await ConferenceService.apiCallAddUpdateConferenceDetails(conferenceRequest);

          if (E.isLeft(conferenceResponse)) {
            addToast({
              type: 'error',
              title: `Conference booking failed: ${conferenceResponse.left.message}`,
            });
            return conferenceResponse;
          }

          if (!conferenceResponse.right.IsSuccess) {
            addToast({
              type: 'error',
              title: getApiMessage(
                conferenceResponse.right.ErrorMessage,
                'Conference room booking failed',
              ),
            });
            return conferenceResponse;
          }

          const savedConferenceId = getSavedConferenceId(
            conferenceResponse.right.Data,
            conferenceBookingId,
          );

          if (savedConferenceId <= 0) {
            addToast({
              type: 'error',
              title: 'Conference booking succeeded, but ConferenceId was not returned.',
            });
            return conferenceResponse;
          }

          setConferenceBookingId(savedConferenceId);
          const savedConferenceData = Array.isArray(conferenceResponse.right.Data)
            ? conferenceResponse.right.Data[0]
            : conferenceResponse.right.Data;
          setConferenceBookingUniqueKey(
            savedConferenceData && typeof savedConferenceData === 'object'
              ? String(savedConferenceData.UniqueKey || '')
              : '',
          );
          successMessage = getApiMessage(
            conferenceResponse.right.SuccessMessage,
            'Meeting saved and conference room booked successfully',
          );
        }

        addToast({ type: 'success', title: successMessage });
        setHasSavedMeetingDetails(true);
        isSaved = true;

        if (navigateAfterSave) {
          navigate('/meeting', { replace: true });
        }

        return meetingResponse;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      isEditMode ? 'Updating Meeting' : 'Scheduling Meeting',
    );

    return isSaved;
  };
  //#endregion

  //#region PUSH FORM DATA
  const PushMOMDocumentsFormData = (): FormData => {

    const fd = new FormData();

    presentationDocuments.forEach(file => {
      if (file instanceof File) {
        fd.append('PresentationDocumentUrl', file);
      }
    });

    momDocuments.forEach(file => {
      if (file instanceof File) {
        fd.append('MOMDocumentUrl', file);
      }
    });

    supportingDocuments.forEach(file => {
      if (file instanceof File) {
        fd.append('SupportingDocumentUrl', file);
      }
    });

    return fd;
  };

  const handleAddUpdateMOMDocuments = async (): Promise<boolean> => {
    let isSaved = false;
    const meetingId = isEditMode ? eventIdNumber : Number(formData.EventId) || 0;

    if (meetingId <= 0) {
      addToast({ type: 'error', title: 'MeetingId is required to upload documents' });
      return false;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateMOMDocumentsRequest = {
          MomDocumentId: 0,
          UniqueKey: DEFAULT_UNIQUE_KEY,
          MeetingId: meetingId,
          RemovePresentationDocumentUrl: removedDocumentUrls.presentation.join(','),
          RemoveMOMDocumentUrl: removedDocumentUrls.mom.join(','),
          RemoveSupportingDocumentUrl: removedDocumentUrls.supporting.join(','),
          FormData: PushMOMDocumentsFormData(),
        };

        const response = await MeetingService.apiCallAddUpdateMOMDocuments(payload);

        if (E.isRight(response)) {
          if (response.right.IsSuccess) {
            addToast({
              type: 'success',
              title: getApiMessage(
                response.right.SuccessMessage,
                'MOM documents saved successfully',
              ),
            });
            isSaved = true;
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(
                response.right.ErrorMessage,
                'Unable to save MOM documents',
              ),
            });
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      'Saving MOM Documents',
    );

    return isSaved;
  };
  //#endregion

  //#region STEPPER ACTION
  const changeStep = async (nextStep: MeetingStepId) => {
    const nextStepIndex = visibleMeetingSteps.findIndex((step) => step.id === nextStep);

    if (
      activeStep === 'meeting-details' &&
      nextStepIndex > activeStepIndex &&
      !hasSavedMeetingDetails
    ) {
      const isSaved = await saveMeeting(false);
      if (!isSaved) return;
    }

    setActiveStep(nextStep);
  };

  const goToPreviousStep = () => {
    if (activeStepIndex <= 0) {
      navigate('/meeting');
      return;
    }

    setActiveStep(visibleMeetingSteps[activeStepIndex - 1].id);
  };

  const goToNextStep = async () => {
    if (isLastStep) {
      if (activeStep === 'documents') {
        const isSaved = await handleAddUpdateMOMDocuments();
        if (!isSaved) return;
      }

      navigate('/meeting', { replace: true });
      return;
    }

    await changeStep(visibleMeetingSteps[activeStepIndex + 1].id);
  };
  //#endregion

  //#region CANCEL MEETING MASTER
  const openCancelDialog = () => setIsCancelDialogOpen(true);
  const closeCancelDialog = () => setIsCancelDialogOpen(false);

  const cancelMeeting = async () => {
    if (!isEditMode) return;

    setIsCanceling(true);

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteMeetingMasterRequest = {
          MeetingId: eventIdNumber,
          UniqueKey: formData.Uniquekey || DEFAULT_UNIQUE_KEY,
        };

        const response = await MeetingService.apiCallDeleteMeetingMaster(params);
        setIsCancelDialogOpen(false);

        if (E.isRight(response)) {
          if (response.right.IsSuccess) {
            addToast({
              type: 'success',
              title: getApiMessage(
                response.right.SuccessMessage,
                'Meeting cancelled successfully',
              ),
            });
            navigate('/meeting', { replace: true });
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(
                response.right.ErrorMessage,
                'Unable to cancel meeting',
              ),
            });
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      'Cancelling Meeting',
    );

    setIsCanceling(false);
  };
  //#endregion

  //#region CANCEL CONFERENCE BOOKING
  const cancelConferenceBooking = async () => {
    setIsCancellingConference(true);

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let bookingId = conferenceBookingId;
        let bookingUniqueKey = conferenceBookingUniqueKey;

        if (bookingId <= 0 || !bookingUniqueKey) {
          const booking = await pullConferenceBooking(
            eventIdNumber,
            bookingId,
          );

          bookingId = booking?.ConferenceRoomBookingId ?? 0;
          bookingUniqueKey = booking?.UniqueKey || '';
        }

        if (bookingId <= 0 || !bookingUniqueKey) {
          addToast({
            type: 'error',
            title: 'Conference booking details not found',
          });
          return;
        }

        const response = await ConferenceService.apiCallDeleteConferenceBooking({
          ConferenceRoomBookingId: bookingId,
          UniqueKey: bookingUniqueKey,
        });

        if (E.isRight(response) && response.right.IsSuccess) {
          setConferenceBookingId(0);
          setConferenceBookingUniqueKey('');
          setMetadata((prev) => ({ ...prev, MeetingMode: 'Online' }));
          handleFieldChange('Room', '');
          setIsConferenceCancelDialogOpen(false);
          addToast({
            type: 'success',
            title: getApiMessage(
              response.right.SuccessMessage,
              'Conference booking cancelled successfully',
            ),
            message: 'Enter the meeting link and save to update this meeting as Online.',
          });
        } else {
          addToast({
            type: 'error',
            title: E.isLeft(response)
              ? response.left.message
              : getApiMessage(
                  response.right.ErrorMessage,
                  'Unable to cancel conference booking',
                ),
          });
        }

        return response;
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: getErrorMessage(error) }),
      undefined,
      'Cancelling Conference Booking',
    );

    setIsCancellingConference(false);
  };
  //#endregion

  //#region RENDER
  return (
    <div className="rounded-lg border border-gray-200 bg-[#F7F8FA] p-5 shadow-sm">
      {/* Loader */}
      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

      {/* MEETING STEPPER */}
      <div className="border-b border-[#E1E5EC] pb-5">
        <Stepper
          steps={visibleMeetingSteps}
          activeStep={activeStep}
          onStepChange={(step) => void changeStep(step.id as MeetingStepId)}
          ariaLabel="Schedule meeting steps"
        />
      </div>

      <div className="mt-6 min-h-[28rem]">
        {/* MEETING DETAILS */}
        {activeStep === 'meeting-details' && (
          <MeetingDetailsSection
            disabled={false}
            allowEmployeeSelection
            formData={formData}
            metadata={metadata}
            errors={errors}
            departmentValues={departmentDropdown.selectedValues}
            departmentOptions={departmentDropdown.initialOptions}
            employeeValues={employeeDropdown.selectedValues}
            employeeOptions={employeeDropdown.initialOptions}
            conferenceRoomOptions={conferenceRoomOptions}
            isLoadingConferenceRooms={isLoadingConferenceRooms}
            onFieldChange={handleFieldChange}
            onMetadataChange={handleMetadataChange}
            onDepartmentsChange={(values) => {
              const { idsString } = departmentDropdown.handleChange(values);
              handleFieldChange('DepartmentId', idsString);
            }}
            onEmployeesChange={(values) => {
              const { idsString } = employeeDropdown.handleChange(values);
              handleFieldChange('EmployeeId', idsString);
            }}
          />
        )}

        {/* MEETING AGENDA */}
        {activeStep === 'agendas' && (
          <MeetingAgendaSection
            agendas={metadata.Agendas}
            meetingId={
              isEditMode || isMomMode
                ? eventIdNumber
                : Number(formData.EventId) || 0
            }
            onChange={(agendas) =>
              setMetadata((prev) => ({ ...prev, Agendas: agendas }))
            }
          />
        )}

        {/* MEETING DOCUMENTS */}
        {activeStep === 'documents' && (
          <MeetingAttachmentsSection
            disabled={false}
            existingMomFiles={existingDocumentUrls.mom}
            existingPresentationFiles={existingDocumentUrls.presentation}
            existingSupportingFiles={existingDocumentUrls.supporting}
            momDocuments={momDocuments}
            presentationDocuments={presentationDocuments}
            supportingDocuments={supportingDocuments}
            onMomDocumentsChange={setMomDocuments}
            onPresentationDocumentsChange={setPresentationDocuments}
            onSupportingDocumentsChange={setSupportingDocuments}
            onRemoveExistingMom={(url) => {
              setRemovedDocumentUrls((prev) => ({
                ...prev,
                mom: Array.from(new Set([...prev.mom, url])),
              }));
            }}
            onRemoveExistingPresentation={(url) => {
              setRemovedDocumentUrls((prev) => ({
                ...prev,
                presentation: Array.from(new Set([...prev.presentation, url])),
              }));
            }}
            onRemoveExistingSupporting={(url) => {
              setRemovedDocumentUrls((prev) => ({
                ...prev,
                supporting: Array.from(new Set([...prev.supporting, url])),
              }));
            }}
          />
        )}
      </div>

      {/* CANCEL MEETING DIALOG */}
      <DeleteDialog
        isOpen={isCancelDialogOpen}
        onClose={closeCancelDialog}
        onConfirm={() => void cancelMeeting()}
        loading={isCanceling}
        pageName="meeting"
        title="Cancel meeting"
        message="Are you sure you want to cancel this meeting? This action cannot be undone."
        confirmText="Yes, cancel meeting"
        variant="warning"
      />

      <DeleteDialog
        isOpen={isConferenceCancelDialogOpen}
        onClose={() => setIsConferenceCancelDialogOpen(false)}
        onConfirm={() => void cancelConferenceBooking()}
        loading={isCancellingConference}
        title="Cancel conference booking"
        message={
          conferenceBookingId > 0
            ? `You need to cancel the physical conference booking with Conference ID ${conferenceBookingId} before updating this meeting as Online.`
            : 'You need to cancel the physical conference booking before updating this meeting as Online.'
        }
        confirmText="Cancel Conference"
        variant="warning"
      />

      {/* BOTTOM ACTION BAR */}
      <div className="mt-8 border-t border-gray-200 pt-4">
        <BottomActionBar
          leftActionText={isEditMode && canAction ? 'Cancel Meeting' : undefined}
          onLeftAction={isEditMode && canAction ? openCancelDialog : undefined}
          cancelText={activeStepIndex === 0 ? 'Back' : 'Previous'}
          saveText={
            activeStep === 'meeting-details'
              ? 'Save & Next'
              : isLastStep
                ? 'Finish'
                : 'Next'
          }
          onCancel={goToPreviousStep}
          onSave={() => void goToNextStep()}
          canAction={!isLastStep || canAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
  //#endregion
};

export default AddUpdateMeeting;
