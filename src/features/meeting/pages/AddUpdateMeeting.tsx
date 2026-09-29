import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import {  Mail, Phone, Search,X } from 'lucide-react';

import { Button, Input } from '@/ui/components/forms';
import RadioPill from '@/ui/components/forms/RadioPill';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { TextArea } from '@/ui/components/forms/Textarea';
import { TimePicker } from '@/ui/components/TimePicker/TimePicker';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import Checkbox from '@/ui/components/forms/Checkbox';
import type { AddUpdateMeetingMasterRequest, DeleteMeetingMasterRequest, ExternalMeetingParticipantRequest, FilterWithPaginationMeetingMasterRequest, FilterWithPaginationMeetingParticipantsRequest, MeetingMode, MeetingParticipantRequest } from '@/features/meeting/models/MeetingModel';
import { conferenceService } from '@/features/conference/services/ConferenceService';
import type { AddUpdateConferenceDetailsRequest, DeleteConferenceBookingRequest, PullConferenceBookingDetailsRequest, PullConferenceDetailsRequest } from '@/features/conference/models/ConferenceModel';
import { meetingService } from '@/features/meeting/services/MeetingService';
import { momService } from '@/features/meeting/services/MomService';
import { useToast } from '@/core/hooks/useToast';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import usePagination from '@/core/hooks/usePagination';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { filterEmail, filterLetters, filterMobile, isValidEmail, isValidMobile } from '@/core/utils/fileValidation';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useMeetingListState } from '@/features/meeting/context/MeetingListStateContext';
import { fetchDesignationMasterDropdown } from '@/features/designationMaster/designationMasterDropDown';
import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService';
import type { DepartmentMasterData, FilterWithPaginationDepartmentMasterRequest } from '@/features/departmentMaster/models/DepartmentMasterModel';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import type { EmployeeMasterData, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import MeetingAgendaSection from '@/features/meeting/components/MeetingAgendaSection';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Stepper } from '@/ui/components/Stepper/Stepper';

const MEETING_TYPES = [
    {
        id: 'Department',
        label: 'Department',
        description:
            'Meeting held for a specific department, with employees attending from it',
    },
    {
        id: 'Employee',
        label: 'Employees',
        description:
            'Meeting organised around a hand-picked list of employees, any department.',
    },
    {
        id: 'External',
        label: 'External Participant',
        description:
            'Meeting with external participants — clients, vendors, contractors, consultants.',
    },
] as const;

const MEETING_STEPS = [
  { id: 'meeting-details', label: 'Meeting Details', icon: 1 },
  { id: 'agendas', label: 'Agendas', icon: 2 },
  { id: 'documents', label: 'Documents', icon: 3 },
] as const;

type MeetingStepId = (typeof MEETING_STEPS)[number]['id'];

const MEETING_MODES: MeetingMode[] = ['Online', 'Physical', 'Onsite'];

const getInitialExternalParticipant = (): ExternalMeetingParticipantRequest => ({
    FullName: '',
    Email: '',
    MobileNo: '',
    OrganizationName: '',
    NoOfParticipants: 1,
    ClientRegistrationId: 0,
    DesignationName: '',
    Remark: '',
});

const INITIAL_FORM_STATE: AddUpdateMeetingMasterRequest = {
  MeetingId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MeetingStartTime: '',
  MeetingEndTime: '',
  MeetingDate: '',
  MeetingTitle: '',
  MeetingType: 'Department',
  MeetingLocation: '',
  MeetingLink: '',
  MeetingStatus: 'New',
  ParticipantDetailsJson: '',
  ExternalParticipantJson: '',
  MeetingMode: 'Physical',
  Remark: '',
  ConferenceId: 0,
  ConferenceRoomId: 0,
};

export const AddUpdateMeeting: React.FC = () => {
    
    const [formData, setFormData] = useState<AddUpdateMeetingMasterRequest>(INITIAL_FORM_STATE);
    const [externalParticipant, setExternalParticipant] = useState<ExternalMeetingParticipantRequest>(() => getInitialExternalParticipant());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const navigate = useNavigate();

    const { meetingId: meetingIdParam } = useParams<{ meetingId?: string }>();
    const meetingIdNumber = meetingIdParam ? Number(meetingIdParam) : 0;
    const isEditMode = meetingIdNumber > 0;

    const { addToast } = useToast();

    const { resetFilters } = useMeetingListState();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [activeStep, setActiveStep] = useState<MeetingStepId>('meeting-details');
    const [momDocumentURLFiles, setMomDocumentURLFiles] = useState<(File | string)[]>([]);
    const [momDocumentURL, setMomDocumentURL] = useState('');
    const [removedMomDocumentURLs, setRemovedMomDocumentURLs] = useState<string[]>([]);
    const [presentationDocumentURLFiles, setPresentationDocumentURLFiles] = useState<(File | string)[]>([]);
    const [presentationDocumentURL, setPresentationDocumentURL] = useState('');
    const [removedPresentationDocumentURLs, setRemovedPresentationDocumentURLs] = useState<string[]>([]);
    const [supportingDocumentURLFiles, setSupportingDocumentURLFiles] = useState<(File | string)[]>([]);
    const [supportingDocumentURL, setSupportingDocumentURL] = useState('');
    const [removedSupportingDocumentURLs, setRemovedSupportingDocumentURLs] = useState<string[]>([]);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [conferenceBookingId, setConferenceBookingId] = useState(0);
    const [conferenceBookingUniqueKey, setConferenceBookingUniqueKey] = useState('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    const [isConferenceCancelDialogOpen, setIsConferenceCancelDialogOpen] = useState(false);
    const [conferenceRoomOptions, setConferenceRoomOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
    const [includeExternalParticipant, setIncludeExternalParticipant] = useState(false);
    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
    const [employeeForMeeting, setEmployeeForMeeting] = useState<EmployeeMasterData[]>([]);
    const [departmentForMeeting, setDepartmentForMeeting] = useState<DepartmentMasterData[]>([]);
    const [isFetchingMoreParticipants, setIsFetchingMoreParticipants] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const [searchTermForParticipant, setSearchTermForParticipant] = useState('');
    const [participantFilters, setParticipantFilters] = useState<FilterInfo>({});

    const { canAction } = useMenuPermissions('/event');
    const isDepartmentMode = formData.MeetingType === 'Department';
    const agendaMeetingId = formData.MeetingId || meetingIdNumber;

    
    const previewEmployees = selectedEmployeeIds.slice(0, 4).map((id) => {
        const emp = employeeForMeeting.find((item) => item.EmployeeId === id);

        return {
            id,
            label: emp?.FullName || '',
            EmployeeCode: emp?.EmployeeCode || '',
            Designation: emp?.Designation || '',
            Department: emp?.Department || '',
        };
    });

    const previewDepartments = selectedDepartmentIds.slice(0, 4).map((id) => {
        const dept = departmentForMeeting.find((item) => item.DepartmentMasterId === id);

        return {
            id,
            label: dept?.DepartmentName || '',
        };
    });

    const visibleParticipantIds = isDepartmentMode
        ? departmentForMeeting.map((item) => item.DepartmentMasterId).filter((id) => id > 0)
        : employeeForMeeting.map((item) => item.EmployeeId).filter((id) => id > 0);

    const isAllVisibleParticipantsSelected =
        visibleParticipantIds.length > 0 &&
        visibleParticipantIds.every((id) =>
            (isDepartmentMode ? selectedDepartmentIds : selectedEmployeeIds).includes(id),
        );

    const toggleEmployeeSelection = (id?: number) => {
        if (!id) return;
        setSelectedEmployeeIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const toggleDepartmentSelection = (id?: number) => {
        if (!id) return;
        setSelectedDepartmentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const toggleSelectAllVisibleParticipants = () => {
        if (isDepartmentMode) {
            setSelectedDepartmentIds((prev) =>
                isAllVisibleParticipantsSelected
                    ? prev.filter((id) => !visibleParticipantIds.includes(id))
                    : [...prev, ...visibleParticipantIds.filter((id) => !prev.includes(id))],
            );
            return;
        }

        setSelectedEmployeeIds((prev) =>
            isAllVisibleParticipantsSelected
                ? prev.filter((id) => !visibleParticipantIds.includes(id))
                : [...prev, ...visibleParticipantIds.filter((id) => !prev.includes(id))],
        );
    };

    const loadEmployeesForMeeting = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationEmployeeMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    EmployeeName: filterParams.EmployeeName?.trim() || undefined,
                    IsCheckPermission: false,
                };

                const response = await employeeMasterService.apiCallPullEmployeeMaster(params);

                if (E.isRight(response)) {
                    setEmployeeForMeeting((prev) =>
                        page === 1
                            ? response.right.Data
                            : [...prev, ...response.right.Data],
                    );

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(
                            response.right.TotalNumberOfRecord /
                                pagination.pageSize,
                        ),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Employee',
        );
    };

    const loadDepartmentsForMeeting = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationDepartmentMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    DepartmentName: filterParams.DepartmentName?.trim() || undefined,
                };

                const response =
                    await departmentMasterService.apiCallPullDepartmentMaster(params);

                if (E.isRight(response)) {
                    setDepartmentForMeeting((prev) =>
                        page === 1
                            ? response.right.Data
                            : [...prev, ...response.right.Data],
                    );

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(
                            response.right.TotalNumberOfRecord /
                                pagination.pageSize,
                        ),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Department',
        );
    };

    const searchParticipant = async (searchValue: string) => {
        const emptyFilters: FilterInfo = {};

        if (searchValue.trim() === '') {
            setParticipantFilters(emptyFilters);

            if (formData.MeetingType === 'Employee') {
                await loadEmployeesForMeeting(1, emptyFilters);
                return;
            }

            if (formData.MeetingType === 'Department') {
                await loadDepartmentsForMeeting(1, emptyFilters);
            }
            return;
        }

        if (formData.MeetingType === 'Employee') {
            const filterParams: FilterInfo = {
                EmployeeName: searchValue.trim(),
            };
            setParticipantFilters(filterParams);
            await loadEmployeesForMeeting(1, filterParams);
            return;
        }

        if (formData.MeetingType === 'Department') {
            const filterParams: FilterInfo = {
                DepartmentName: searchValue.trim(),
            };
            setParticipantFilters(filterParams);
            await loadDepartmentsForMeeting(1, filterParams);
        }
    };

    const debouncedParticipantSearch = useDebouncedCallback((value: string) => {
        searchParticipant(value);
    }, 350);

    const handleParticipantModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const threshold = 60;

        if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {
            if (
                pagination.currentPage < pagination.totalPages &&
                !isFetchingMoreParticipants
            ) {
                const nextPage = pagination.currentPage + 1;
                setIsFetchingMoreParticipants(true);

                const loadNext =
                    formData.MeetingType === 'Employee'
                        ? loadEmployeesForMeeting(nextPage, participantFilters)
                        : loadDepartmentsForMeeting(nextPage, participantFilters);

                loadNext.finally(() => setIsFetchingMoreParticipants(false));
            }
        }
    };

    const handleOpenParticipantModal = async () => {
        setIsParticipantModalOpen(true);
        setSearchTermForParticipant('');
        setParticipantFilters({});

        if (formData.MeetingType === 'Employee') {
            await loadEmployeesForMeeting(1, {});
            return;
        }

        if (formData.MeetingType === 'Department') {
            await loadDepartmentsForMeeting(1, {});
        }
    };

    const handleApplyParticipantSelection = (e: React.FormEvent) => {
        e.preventDefault();
        setIsParticipantModalOpen(false);
        setSearchTermForParticipant('');
        setParticipantFilters({});
    };

    const loadMeetingParticipants = async (meetingId: number) => {
        const params: FilterWithPaginationMeetingParticipantsRequest = {
            PageNumber: 1,
            PageSize: 1000,
            MeetingId: meetingId,
        };

        const response = await meetingService.apiCallPullMeetingParticipants(params);

        if (E.isRight(response)) {
            return response.right.Data;
        }

        addToast({ type: 'error', title: response.left.message });
        return [];
    };

    const loadConferenceRooms = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: PullConferenceDetailsRequest = {
                    PageSize: 100,
                    PageNumber: 1,
                    RoomId: 0,
                };

                const response = await conferenceService.apiCallPullConferenceDetails(params);

                if (E.isRight(response)) {
                    setConferenceRoomOptions(
                        response.right.Data.map((room) => ({
                            label: room.RoomName,
                            value: String(room.ConferenceRoomId),
                        })),
                    );
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Conference',
        );
    };

    const pullConferenceBooking = async (meetingId: number) => {
        const params: PullConferenceBookingDetailsRequest = {
            PageSize: 10,
            PageNumber: 1,
            MeetingId: meetingId,
        };

        const response =
            await conferenceService.apiCallPullConferenceBookingDetails(params);

        if (E.isRight(response)) {
            const booking = response.right.Data?.[0];

            if (booking) {
                setConferenceBookingId(booking.ConferenceRoomBookingId);
                setConferenceBookingUniqueKey(booking.UniqueKey || '');
                setFormData((prev) => ({
                    ...prev,
                    ConferenceRoomId: booking.RoomId,
                }));
            }
        } else {
            addToast({ type: 'error', title: response.left.message });
        }
    };

    const activeStepIndex = MEETING_STEPS.findIndex(
        (step) => step.id === activeStep,
    );
    const isLastStep = activeStepIndex === MEETING_STEPS.length - 1;

    useEffect(() => {
        loadConferenceRooms();
    }, []);

    useEffect(() => {
        if (meetingIdNumber) {
            fetchMeetingDetails();
            return;
        }
    }, [meetingIdNumber]);

    
    const handleFieldChange = (
        field: keyof AddUpdateMeetingMasterRequest,
        value: any,
    ) => {
        if (
            field === 'MeetingMode' &&
            value === 'Online' &&
            isEditMode &&
            formData.MeetingMode === 'Physical'
        ) {
            setIsConferenceCancelDialogOpen(true);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'MeetingMode' && {
                MeetingLink: '',
                MeetingLocation: '',
                ConferenceRoomId: 0,
            }),
        }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleExternalParticipantChange = (
        field: keyof ExternalMeetingParticipantRequest,
        value: any,
    ) => {
        setExternalParticipant((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };
    
    const fetchMeetingDetails = async () => {


        
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMeetingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    MeetingId: meetingIdNumber,
                };

                const response = await meetingService.apiCallPullMeetingMaster(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            MeetingId: e.MeetingId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            MeetingStartTime: e.MeetingStartTime ?? '',
                            MeetingEndTime: e.MeetingEndTime ?? '',
                            MeetingDate: e.MeetingDate ?? '',
                            MeetingTitle: e.MeetingTitle ?? '',
                            MeetingLocation: e.MeetingLocation ?? '',
                            MeetingLink: e.MeetingLink ?? '',
                            MeetingStatus: e.MeetingStatus ?? '',
                            MeetingMode: e.MeetingMode as AddUpdateMeetingMasterRequest['MeetingMode'],
                            Remark: e.Remark ?? '',
                        }));

                        setMomDocumentURL(e.MOMDocumentUrl || '');
                        setPresentationDocumentURL(e.PresentationDocumentUrl || '');
                        setSupportingDocumentURL(e.SupportingDocumentUrl || '');

                        if (e.MeetingMode === 'Physical') {
                            await pullConferenceBooking(e.MeetingId);
                        } 

                        const participants = await loadMeetingParticipants(e.MeetingId);

                        const external = participants.find(
                            (p) => p.MeetingType === 'External' || (p.ExternalId && p.ExternalId > 0),
                        );

                        if (external) {
                            setExternalParticipant({
                                FullName: external.ParticipantName || '',
                                Email: external.EmaEmail || '',
                                MobileNo: external.MobileNo || '',
                                OrganizationName: external.OrganizationName || '',
                                NoOfParticipants: 1,
                                ClientRegistrationId: e.ClientRegistrationId ?? 0,
                                DesignationName: external.DesignationName || '',
                                Remark: external.Remark || '',
                            });
                            setIncludeExternalParticipant(true);
                        } else {
                            setIncludeExternalParticipant(false);
                        }

                        const internalParticipants = participants.filter(
                            (p) => p.MeetingType !== 'External' && (!p.ExternalId || p.ExternalId === 0),
                        );
                        const participantIds = internalParticipants.map((item) => item.ParticipantId);

                        const meetingType = (
                            e.MeetingType === 'External' && internalParticipants.length > 0
                                ? internalParticipants[0].MeetingType
                                : e.MeetingType
                        ) as AddUpdateMeetingMasterRequest['MeetingType'];

                        setFormData((prev) => ({ ...prev, MeetingType: meetingType }));

                        if (meetingType === 'Employee') {
                            setSelectedEmployeeIds(participantIds);
                            setEmployeeForMeeting(
                                internalParticipants.map((p) => ({
                                    EmployeeId: p.ParticipantId,
                                    EmployeeCode: '',
                                    FullName: p.ParticipantName || '',
                                    Designation: p.DesignationName || '',
                                    Department: p.DepartmentName || '',
                                } as EmployeeMasterData)),
                            );
                        } else if (meetingType === 'Department') {
                            setSelectedDepartmentIds(participantIds);
                            setDepartmentForMeeting(
                                internalParticipants.map((p) => ({
                                    DepartmentMasterId: p.ParticipantId,
                                    DepartmentName: p.ParticipantName || '',
                                } as DepartmentMasterData)),
                            );
                        }
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Meeting',
        );
    };
    
    const handleMeetingTypeToggle = (typeId: 'Department' | 'Employee' | 'External') => {
        if (typeId === 'External') {
            const next = !includeExternalParticipant;
            setIncludeExternalParticipant(next);

            if (!next) {
                setExternalParticipant(getInitialExternalParticipant());
                if (formData.MeetingType === 'External') {
                    handleFieldChange('MeetingType', 'Department');
                }
            } else if (
                formData.MeetingType !== 'Department' &&
                formData.MeetingType !== 'Employee'
            ) {
                handleFieldChange('MeetingType', 'External');
            }
            return;
        }

        if (formData.MeetingType === typeId) {
            if (includeExternalParticipant) {
                handleFieldChange('MeetingType', 'External');
                if (typeId === 'Department') setSelectedDepartmentIds([]);
                if (typeId === 'Employee') setSelectedEmployeeIds([]);
            }
            return;
        }

        handleFieldChange('MeetingType', typeId);
        if (typeId === 'Department') {
            setSelectedEmployeeIds([]);
        } else {
            setSelectedDepartmentIds([]);
        }
    };

    const isMeetingTypeSelected = (typeId: 'Department' | 'Employee' | 'External') => {
        if (typeId === 'External') return includeExternalParticipant;
        return formData.MeetingType === typeId;
    };

    const validateMeetingForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [k: string]: string } = {};

        if (!formData.MeetingTitle?.trim()) {
            newErrors.MeetingTitle = 'Meeting subject is required';
        }

        if (!formData.MeetingDate) {
            newErrors.MeetingDate = 'Meeting date is required';
        }

        if (!formData.MeetingStartTime) {
            newErrors.MeetingStartTime = 'Start time is required';
        }

        if (!formData.MeetingEndTime) {
            newErrors.MeetingEndTime = 'End time is required';
        } else if (
            formData.MeetingStartTime &&
            formData.MeetingEndTime <= formData.MeetingStartTime
        ) {
            newErrors.MeetingEndTime = 'End time must be after start time';
        }

        if (formData.MeetingMode === 'Online' && !formData.MeetingLink?.trim()) {
            newErrors.MeetingLink = 'Meeting link is required';
        }

        if (formData.MeetingMode === 'Onsite' && !formData.MeetingLocation?.trim()) {
            newErrors.MeetingLocation = 'Meeting location is required';
        }

        if (formData.MeetingMode === 'Physical' && !formData.ConferenceRoomId) {
            newErrors.ConferenceRoomId = 'Meeting location is required';
        }

        if (
            formData.MeetingType !== 'Department' &&
            formData.MeetingType !== 'Employee' &&
            !includeExternalParticipant
        ) {
            newErrors.MeetingType = 'Select at least one meeting participant type';
        }

        if (formData.MeetingType === 'Department') {
            if (selectedDepartmentIds.length === 0) {
                newErrors.DepartmentId = 'Department is required';
            }
        } else if (formData.MeetingType === 'Employee') {
            if (selectedEmployeeIds.length === 0) {
                newErrors.EmployeeId = 'At least one employee is required';
            }
        }

        if (includeExternalParticipant) {
            if (!externalParticipant.FullName.trim()) {
                newErrors.FullName = 'Participant name is required';
            }

            if (
                externalParticipant.MobileNo.trim() &&
                !isValidMobile(externalParticipant.MobileNo)
            ) {
                newErrors.MobileNo = 'Enter a valid mobile number';
            }

            if (
                externalParticipant.Email.trim() &&
                !isValidEmail(externalParticipant.Email)
            ) {
                newErrors.Email = 'Enter a valid e-mail';
            }
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushMeetingMasterFormData = (): AddUpdateMeetingMasterRequest => {
        const participants: MeetingParticipantRequest[] =
            formData.MeetingType === 'Department'
                ? selectedDepartmentIds.map((departmentId) => ({
                    ParticipantType: 'Department',
                    ParticipantId: departmentId,
                }))
                : formData.MeetingType === 'Employee'
                    ? selectedEmployeeIds.map((employeeId) => ({
                        ParticipantType: 'Employee',
                        ParticipantId: employeeId,
                    }))
                    : [];

        return {
            ...formData,
            MeetingType: includeExternalParticipant ? 'External' : formData.MeetingType,
            ParticipantDetailsJson: JSON.stringify(participants),
            ExternalParticipantJson: JSON.stringify(
                includeExternalParticipant ? [externalParticipant] : [],
            ),
            ConferenceId: conferenceBookingId,
        };
    };

    const handleAddUpdateMeeting = async (nextStepOnSuccess?: MeetingStepId) => {
        setErrors({});

        const validation = validateMeetingForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            setActiveStep('meeting-details');
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushMeetingMasterFormData();
                const response = await meetingService.apiCallAddUpdateMeetingMaster(payload);

                if (E.isRight(response)) {
                    addToast({
                        type: 'success',
                        title: response.right.SuccessMessage?.[0],
                    });

                    const savedMeeting = response.right.Data?.[0];

                    if (savedMeeting) {
                        setFormData((prev) => ({
                            ...prev,
                            MeetingId: savedMeeting.MeetingId,
                            UniqueKey: savedMeeting.UniqueKey,
                        }));

                        if (formData.MeetingMode === 'Physical') {
                            const conferencePayload: AddUpdateConferenceDetailsRequest = {
                                ConferenceRoomBookingId: conferenceBookingId,
                                UniqueKey: conferenceBookingUniqueKey,
                                RoomId: formData.ConferenceRoomId,
                                MeetingDate: formData.MeetingDate
                                    ? `${formData.MeetingDate.trim().split('T')[0]}T${(formData.MeetingStartTime?.trim() || '00:00:00').split('.')[0]}`
                                    : '',
                                StartTime: formData.MeetingStartTime,
                                EndTime: formData.MeetingEndTime,
                                MeetingId: savedMeeting.MeetingId,
                                BookingStatus: 'Booked',
                                Conclusion: '',
                                Purpose: formData.MeetingTitle,
                                ConferenceTitle: formData.MeetingTitle,
                            };

                            const conferenceResponse =
                                await conferenceService.apiCallAddUpdateConferenceDetails(
                                    conferencePayload,
                                );

                            if (E.isRight(conferenceResponse)) {
                                const booking = conferenceResponse.right.Data?.[0];

                                if (booking) {
                                    setConferenceBookingId(booking.ConferenceRoomBookingId);
                                    setConferenceBookingUniqueKey(booking.UniqueKey);
                                }
                            } else {
                                addToast({
                                    type: 'error',
                                    title: conferenceResponse.left.message,
                                });
                                return conferenceResponse;
                            }
                        }

                        if (nextStepOnSuccess) {
                            setActiveStep(nextStepOnSuccess);
                        }
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            isEditMode ? 'Updating Meeting' : 'Scheduling Meeting',
        );
    };
    
    const PushMOMDocumentsFormData = (): FormData => {
        const fd = new FormData();
        fd.append('MomDocumentId', '0');
        fd.append('UniqueKey', formData.UniqueKey || '');
        fd.append('MeetingId', String(formData.MeetingId || meetingIdNumber));

        presentationDocumentURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append('PresentationDocumentUrl', file);
            }
        });

        momDocumentURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append('MOMDocumentUrl', file);
            }
        });

        supportingDocumentURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append('SupportingDocumentUrl', file);
            }
        });

        fd.append('RemovePresentationDocumentUrl', removedPresentationDocumentURLs.join(','));
        fd.append('RemoveMOMDocumentUrl', removedMomDocumentURLs.join(','));
        fd.append('RemoveSupportingDocumentUrl', removedSupportingDocumentURLs.join(','));

        return fd;
    };

    const handleAddUpdateMOMDocuments = async () => {
        const meetingId = formData.MeetingId || meetingIdNumber;

        if (!meetingId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushMOMDocumentsFormData();
                const response = await momService.apiCallAddUpdateMOMDocuments(payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
                    resetFilters();
                    navigate('/meeting');
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Saving MOM Documents',
        );
    };
      
    const changeStep = async (nextStep: MeetingStepId) => {
        const nextStepIndex = MEETING_STEPS.findIndex(
            (step) => step.id === nextStep,
        );

        if (
            activeStep === 'meeting-details' &&
            nextStepIndex > activeStepIndex
        ) {
            await handleAddUpdateMeeting(nextStep);
            return;
        }

        setActiveStep(nextStep);
    };

    const goToPreviousStep = () => {
        if (activeStepIndex <= 0) {
            navigate('/meeting');
            return;
        }

        setActiveStep(MEETING_STEPS[activeStepIndex - 1].id);
    };

    const goToNextStep = async () => {
        if (isLastStep) {
            if (activeStep === 'documents') {
                await handleAddUpdateMOMDocuments();
                return;
            }

            resetFilters();
            navigate('/meeting');
            return;
        }

        await changeStep(MEETING_STEPS[activeStepIndex + 1].id);
    };
    
    const openCancelDialog = () => {
        setIsCancelDialogOpen(true);
    };

    const closeCancelDialog = () => {
        setIsCancelDialogOpen(false);
    };

    const cancelMeeting = async () => {
        setIsCancelDialogOpen(false);

        if (!isEditMode) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMeetingMasterRequest = {
                    MeetingId: meetingIdNumber,
                    UniqueKey: formData.UniqueKey || '',
                };

                const response = await meetingService.apiCallDeleteMeetingMaster(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
                    navigate('/meeting');
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Cancelling Meeting',
        );
    };

    const cancelConferenceBooking = async () => {
        setIsConferenceCancelDialogOpen(false);

        if (!conferenceBookingId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteConferenceBookingRequest = {
                    ConferenceRoomBookingId: conferenceBookingId,
                    UniqueKey: conferenceBookingUniqueKey || '',
                };

                const response = await conferenceService.apiCallDeleteConferenceBooking(params);

                if (E.isRight(response)) {
                    setConferenceBookingId(0);
                    setConferenceBookingUniqueKey('');
                    setFormData((prev) => ({
                        ...prev,
                        MeetingMode: 'Online',
                        MeetingLink: '',
                        MeetingLocation: '',
                        ConferenceRoomId: 0,
                    }));
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Cancelling Conference Booking',
        );
    };

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="pb-2">
                <Stepper
                    steps={MEETING_STEPS}
                    activeStep={activeStep}
                    onStepChange={(step) => {
                        changeStep(step.id as MeetingStepId);
                    }}
                    ariaLabel="Schedule meeting steps"
                />
            </div>

            <div className="mt-2 min-h-[28rem] ">

                {activeStep === 'meeting-details' && (
                    <div className="space-y-6 px-6 sm:px-8">
                        <div className="space-y-6 pb-2">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                                Meeting Details
                            </h3>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                {MEETING_TYPES.map((meetingType) => {
                                    const checked = isMeetingTypeSelected(meetingType.id);

                                    return (
                                        <label
                                            key={meetingType.id}
                                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${checked
                                                ? 'border-[#135bec] bg-[#EBF2FF]'
                                                : 'border-[#B8CBFA] bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 shrink-0 accent-[#135bec]"
                                                    checked={checked}
                                                    onChange={() => {
                                                        handleMeetingTypeToggle(meetingType.id);
                                                    }}
                                                />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {meetingType.label}
                                                </p>
                                            </div>
                                            <p className="mt-1 pl-6 text-xs leading-5 text-gray-500">
                                                {meetingType.description}
                                            </p>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.MeetingType && (
                                <p className="text-sm text-red-600">{errors.MeetingType}</p>
                            )}

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div>
                                    <Input
                                        label="Meeting Subject"
                                        required
                                        value={formData.MeetingTitle}
                                        onChange={(e) =>
                                            handleFieldChange('MeetingTitle', e.target.value)
                                        }
                                        placeholder="Enter meeting subject"
                                        error={errors.MeetingTitle}
                                    />
                                </div>

                                <div>
                                    <DatePickerInput
                                        label="Meeting Date"
                                        required
                                        value={formatDate_dd_mm_yyyy(formData.MeetingDate)}
                                        onChange={(val) =>
                                            handleFieldChange(
                                                'MeetingDate',
                                                convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '',
                                            )
                                        }
                                        minDate={new Date()}
                                        error={errors.MeetingDate}
                                    />
                                </div>

                                <div>
                                    <TimePicker
                                        label="Meeting Start Time"
                                        required
                                        size="sm"
                                        format={24}
                                        value={formData.MeetingStartTime}
                                        onChange={(val) =>
                                            handleFieldChange('MeetingStartTime', val)
                                        }
                                        error={errors.MeetingStartTime}
                                    />
                                </div>

                                <div>
                                    <TimePicker
                                        label="Meeting End Time"
                                        required
                                        size="sm"
                                        format={24}
                                        value={formData.MeetingEndTime}
                                        onChange={(val) =>
                                            handleFieldChange('MeetingEndTime', val)
                                        }
                                        error={errors.MeetingEndTime}
                                    />
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">Meeting Mode</p>
                                    <div className="flex w-full gap-2">
                                        {MEETING_MODES.map((mode) => (
                                            <RadioPill
                                                key={mode}
                                                name="meeting-mode"
                                                label={mode}
                                                checked={formData.MeetingMode === mode}
                                                className="h-10 min-w-0 flex-1 px-3 text-sm font-medium"
                                                onChange={() => {
                                                    if (mode === formData.MeetingMode) return;
                                                    handleFieldChange('MeetingMode', mode);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {formData.MeetingMode === 'Online' ? (
                                    <div>
                                        <Input
                                            label="Meeting Link"
                                            required
                                            value={formData.MeetingLink}
                                            onChange={(e) =>
                                                handleFieldChange('MeetingLink', e.target.value)
                                            }
                                            placeholder="Enter meeting link"
                                            error={errors.MeetingLink}
                                        />
                                    </div>
                                ) : formData.MeetingMode === 'Onsite' ? (
                                    <div>
                                        <Input
                                            label="Meeting Location"
                                            required
                                            value={formData.MeetingLocation}
                                            onChange={(e) =>
                                                handleFieldChange('MeetingLocation', e.target.value)
                                            }
                                            placeholder="Enter meeting location"
                                            error={errors.MeetingLocation}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <SinglePageSelection
                                            label="Meeting Location"
                                            required
                                            value={
                                                formData.ConferenceRoomId > 0
                                                    ? String(formData.ConferenceRoomId)
                                                    : ''
                                            }
                                            onChange={(value) =>
                                                handleFieldChange('ConferenceRoomId', Number(value))
                                            }
                                            options={conferenceRoomOptions}
                                            placeholder="Select location"
                                            error={errors.ConferenceRoomId}
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-3">
                                    <TextArea
                                        label="Remark"
                                        rows={4}
                                        value={formData.Remark}
                                        onChange={(e) => handleFieldChange('Remark', e.target.value)}
                                        placeholder="Enter remark"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.MeetingType === 'Department' && (
                            <div className="space-y-6 pb-3">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                                    Employee Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Department Attending Meeting{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleOpenParticipantModal}
                                        className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                        fullWidth
                                    >
                                        {selectedDepartmentIds.length > 0
                                            ? `${selectedDepartmentIds.length} selected`
                                            : 'Select Department Attending Meeting'}
                                    </Button>
                                    {errors.DepartmentId && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.DepartmentId}
                                        </p>
                                    )}
                                </div>

                                {previewDepartments.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {previewDepartments.map((department) => (
                                            <div
                                                key={department.id}
                                                className="relative rounded-lg border border-gray-200 bg-white p-3 pr-8"
                                            >
                                                <div className="absolute right-1 top-1">
                                                    <Button
                                                        color="transparent"
                                                        size="sm"
                                                        isborderRadius
                                                        aria-label={`Remove ${department.label}`}
                                                        onClick={() => {
                                                            setSelectedDepartmentIds((prev) =>
                                                                prev.filter((id) => id !== department.id),
                                                            );
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <span className="truncate text-sm font-semibold text-gray-900">
                                                    {department.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {formData.MeetingType === 'Employee' && (
                            <div className="space-y-6 pb-3">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                                    Employee Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Employees Attending Meeting{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Button
                                        variant="outline"
                                        onClick={handleOpenParticipantModal}
                                        className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                        fullWidth
                                    >
                                        {selectedEmployeeIds.length > 0
                                            ? `${selectedEmployeeIds.length} selected`
                                            : 'Select Employees Attending Meeting'}
                                    </Button>
                                    {errors.EmployeeId && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.EmployeeId}
                                        </p>
                                    )}
                                </div>

                                {previewEmployees.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {previewEmployees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                className="relative rounded-lg border border-gray-200 bg-white p-3 pr-8"
                                            >
                                                <div className="absolute right-1 top-1">
                                                    <Button
                                                        color="transparent"
                                                        size="sm"
                                                        isborderRadius
                                                        aria-label={`Remove ${employee.label}`}
                                                        onClick={() => {
                                                            setSelectedEmployeeIds((prev) =>
                                                                prev.filter((id) => id !== employee.id),
                                                            );
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 pr-2">
                                                    <span className="truncate text-sm font-semibold text-gray-900">
                                                        {employee.label}
                                                    </span>
                                                    {employee.EmployeeCode ? (
                                                        <span className="shrink-0 rounded-md bg-[#E8EEF7] px-2 py-0.5 text-[10px] font-medium text-[#5E6673]">
                                                            {employee.EmployeeCode}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-xs text-[#5E6673]">
                                                    {employee.Designation || '-'}
                                                    {employee.Department
                                                        ? ` - (${employee.Department})`
                                                        : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {includeExternalParticipant && (
                            <div className="space-y-6 pb-3">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                                    External Participant Details
                                </h3>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    <div>
                                        <Input
                                            label="Participant Name"
                                            required
                                            value={externalParticipant.FullName}
                                            onChange={(e) =>
                                                handleExternalParticipantChange(
                                                    'FullName',
                                                    filterLetters(e.target.value),
                                                )
                                            }
                                            placeholder="Enter participant name"
                                            error={errors.FullName}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Company Name"
                                            value={externalParticipant.OrganizationName}
                                            onChange={(e) =>
                                                handleExternalParticipantChange(
                                                    'OrganizationName',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter company name"
                                            error={errors.OrganizationName}
                                        />
                                    </div>
                                    <div>
                                        <SingleSelectDropdownWithPagination
                                            label="Designation"
                                            title="Select Designation"
                                            dataFetchCallBack={fetchDesignationMasterDropdown}
                                            initialValue={createDropdownInitialValue(
                                                externalParticipant.DesignationName || null,
                                                externalParticipant.DesignationName,
                                            )}
                                            onSelected={(item) =>
                                                handleExternalParticipantChange(
                                                    'DesignationName',
                                                    item?.label || '',
                                                )
                                            }
                                            error={errors.DesignationName}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            leftIcon="+91"
                                            label="Mobile Number"
                                            value={externalParticipant.MobileNo}
                                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                            onChange={(e) =>
                                                handleExternalParticipantChange(
                                                    'MobileNo',
                                                    filterMobile(e.target.value),
                                                )
                                            }
                                            placeholder="Enter mobile number"
                                            error={errors.MobileNo}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="E-Mail ID"
                                            value={externalParticipant.Email}
                                            rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                                            onChange={(e) =>
                                                handleExternalParticipantChange(
                                                    'Email',
                                                    filterEmail(e.target.value),
                                                )
                                            }
                                            placeholder="Enter E-Mail ID"
                                            error={errors.Email}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Remark"
                                            value={externalParticipant.Remark || ''}
                                            onChange={(e) =>
                                                handleExternalParticipantChange('Remark', e.target.value)
                                            }
                                            placeholder="Enter remark"
                                            error={errors.Remark}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {activeStep === 'agendas' && (
                    <MeetingAgendaSection
                        meetingId={agendaMeetingId}
                    />
                )}


                {activeStep === 'documents' && (
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                            Documents
                        </h3>
                        <div className="flex flex-col gap-4">
                            <MultiFilePicker
                                placeholder="Select MOM document"
                                value={momDocumentURLFiles}
                                availableFilesURL={momDocumentURL}
                                onChange={setMomDocumentURLFiles}
                                allowedTypes={['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                onRemoveExisting={(url) => {
                                    setRemovedMomDocumentURLs((prev) => [...prev, url]);
                                }}
                            />

                            <MultiFilePicker
                                placeholder="Select presentation"
                                value={presentationDocumentURLFiles}
                                availableFilesURL={presentationDocumentURL}
                                onChange={setPresentationDocumentURLFiles}
                                allowedTypes={['application/pdf','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']}
                                onRemoveExisting={(url) => {
                                    setRemovedPresentationDocumentURLs((prev) => [...prev, url]);
                                }}
                            />

                            <MultiFilePicker
                                placeholder="Select supporting document"
                                value={supportingDocumentURLFiles}
                                availableFilesURL={supportingDocumentURL}
                                onChange={setSupportingDocumentURLFiles}
                                allowedTypes={['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv']}
                                onRemoveExisting={(url) => {
                                    setRemovedSupportingDocumentURLs((prev) => [...prev, url]);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isParticipantModalOpen}
                onClose={() => setIsParticipantModalOpen(false)}
                title={
                    formData.MeetingType === 'Department'
                        ? 'Select Department'
                        : 'Select Employee'
                }
                onSubmit={handleApplyParticipantSelection}
                saveText="Add"
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">

                    <div className="px-2 py-2">

                        <div className="flex items-center gap-3 w-full">

                            <Checkbox
                                id="select-all-participants"
                                checked={isAllVisibleParticipantsSelected}
                                onChange={toggleSelectAllVisibleParticipants}
                            />

                            <div className="relative min-w-0 w-[526px]">
                                <Input
                                    type="text"
                                    value={searchTermForParticipant}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setSearchTermForParticipant(v);
                                        debouncedParticipantSearch(v);
                                    }}
                                    placeholder={
                                        isDepartmentMode
                                            ? 'Search By Department'
                                            : 'Search By Employee'
                                    }
                                    leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                                />
                            </div>

                            <span className="text-sm text-gray-600 whitespace-nowrap ml-auto">
                                {isDepartmentMode
                                    ? selectedDepartmentIds.length
                                    : selectedEmployeeIds.length}{' '}
                                selected
                            </span>

                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex-1 min-h-0 overflow-auto thin-scroll divide-y divide-gray-200" onScroll={handleParticipantModalScroll} style={{ maxHeight: '55vh' }}>
                            {formData.MeetingType === 'Department' ? (
                                departmentForMeeting.length > 0 ? (

                                    departmentForMeeting.map((n) => {
                                        const id = n.DepartmentMasterId;
                                        const checked = selectedDepartmentIds.includes(id);

                                        return (
                                            <div key={id} className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                                                onClick={(ev) => {
                                                    if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                                                    toggleDepartmentSelection(id);
                                                }}>

                                                <div className="flex items-center">

                                                    <Checkbox
                                                        checked={checked}
                                                        onChange={() => toggleDepartmentSelection(id)}
                                                        onClick={(ev) => ev.stopPropagation()}
                                                        aria-label={`Select ${n.DepartmentName}`}
                                                    />

                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm text-gray-800 whitespace-normal break-words">
                                                            {n.DepartmentName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <NoDataView />
                                )
                            ) : employeeForMeeting.length > 0 ? (

                                employeeForMeeting.map((n) => {
                                    const id = n.EmployeeId;
                                    const checked = selectedEmployeeIds.includes(id);

                                    return (
                                        <div key={id} className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                                            onClick={(ev) => {
                                                if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                                                toggleEmployeeSelection(id);
                                            }}>

                                            <div className="flex items-center">

                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() => toggleEmployeeSelection(id)}
                                                    onClick={(ev) => ev.stopPropagation()}
                                                    aria-label={`Select ${n.FullName}`}
                                                />

                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm text-gray-800 whitespace-normal break-words">
                                                        {n.FullName}
                                                    </p>

                                                    <div className="text-xs text-gray-500">
                                                        {n.EmployeeCode ? n.EmployeeCode : null}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 mt-1">
                                                    <p className="text-xs text-gray-500 flex-1 whitespace-normal break-words">
                                                        Department : {n.Department}
                                                    </p>

                                                </div>

                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <NoDataView />
                            )}

                            {isFetchingMoreParticipants && (

                                <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isCancelDialogOpen}
                onClose={closeCancelDialog}
                onConfirm={() => {
                    cancelMeeting();
                }}
                loading={isLoading}
                pageName="meeting"
            />

            <DeleteDialog
                isOpen={isConferenceCancelDialogOpen}
                onClose={() => setIsConferenceCancelDialogOpen(false)}
                onConfirm={() => {
                    cancelConferenceBooking();
                }}
                loading={isLoading}
                pageName="conference booking"
            />

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
                onSave={() => {
                    goToNextStep();
                }}
                canAction={!isLastStep || canAction}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateMeeting;
