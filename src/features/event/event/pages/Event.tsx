import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { getMonthDateRange } from '@/core/utils/comman';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import useToast from '@/core/hooks/useToast';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { fetchProjectDropdown } from '@/features/projectMaster/projectDropdown';
import {
  AddUpdateEventModal,
  EventCalendarHeader,
  EventCalendarSidebar,
  ViewEventModal,
} from '@/features/event/event/components';
import {
  getInitialEventFormState,
  type CalendarView,
} from '@/features/event/event/constants/eventConstants';
import type { AddUpdateEventRequest, EventData, FilterWithPaginationEventRequest } from '@/features/event/event/models/EventModel';
import { EventService } from '@/features/event/event/services/EventService';
import {
  buildCalendarEvents,
  getEventsForSelectedDate,
  getFilteredEventsForTab,
} from '@/features/event/event/utils/eventUtils';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import CustomCalendar from '@/ui/components/Calender/CustomCalendar';

const Event: React.FC = () => {

  //#region STATE MANAGEMENT
  const [eventList, setEventList] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  // TOAST
  const { addToast } = useToast();


  // MODAL STATES
  const [isAddUpdateEventModalOpen, setIsAddUpdateEventModalOpen] = useState(false);
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
  const [editingEventData, setEditingEventData] = useState<EventData | null>(null);

  // FORM STATES
  const [formData, setFormData] = useState<AddUpdateEventRequest>(() => getInitialEventFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentUrls, setRemovedDocumentUrls] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string | null>(null);
  const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);
  const [selectedProjectValues, setSelectedProjectValues] = useState<string | number | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [lockedEventType, setLockedEventType] = useState<string | null>(null);

  // CALENDAR STATES
  const [activeTab, setActiveTab] = useState('All');
  const [viewActiveTab, setViewActiveTab] = useState('All');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('dayGridMonth');

  const employeeMasterDropdown = useMultiSelectDropdown({
    value: selectedEmployeeValues,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  const projectMasterDropdown = useMultiSelectDropdown({
    value: selectedProjectValues,
    fetchCallback: fetchProjectDropdown,
    autoFetchOptions: true,
  });
  //#endregion

  //#region DATA LOADING | FETCH | LOAD
  const loadEvent = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const { fromDate, toDate } = getMonthDateRange(currentDate);
        const params: FilterWithPaginationEventRequest = {
          EventId: 0,
          FromDate: fromDate.toISOString(),
          ToDate: toDate.toISOString(),
          Type: activeTab === 'All' ? '' : activeTab,
        };

        const response = await EventService.apiCallPullEvent(params);

        if (E.isRight(response)) {
          setEventList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: unknown) => {
        const requestError = error as Error;
        addToast({ type: 'error', title: requestError.message });
      },
      undefined,
      'Loading Event',
    );
  }, [activeTab, addToast, currentDate]);
  //#endregion

  //#region INIT
  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    const navigationState = location.state as {
      openAddType?: string;
      returnTo?: string;
    } | null;

    if (!navigationState?.openAddType) return;

    setEditingEventData(null);
    setFormData({
      ...getInitialEventFormState(),
      Type: navigationState.openAddType,
    });
    setErrors({});
    setReturnTo(navigationState.returnTo || null);
    setLockedEventType(navigationState.openAddType);
    setIsAddUpdateEventModalOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!isAddUpdateEventModalOpen) return;

    if (editingEventData) {
      setFormData({
        EventId: editingEventData.EventId,
        Uniquekey: editingEventData.Uniquekey || getInitialEventFormState().Uniquekey,
        Type: editingEventData.Type || '',
        Title: editingEventData.Title || '',
        ProjectId: editingEventData.ProjectId || '',
        DepartmentId: editingEventData.DepartmentId || '',
        EmployeeId: editingEventData.EmployeeId || undefined,
        Date: editingEventData.Date || '',
        DeadlineDate: editingEventData.DeadlineDate || '',
        StartTime: editingEventData.StartTime || '',
        EndTime: editingEventData.EndTime || '',
        Room: editingEventData.Room || '',
        Priority: editingEventData.Priority || '',
        Description: editingEventData.Description || '',
      });
      setDocumentFiles([]);
      setDocumentURL(editingEventData.DocumentURL ?? null);
      setRemovedDocumentUrls([]);
    } else {
      setFormData((current) => (current.Type ? current : getInitialEventFormState()));
    }

    setErrors({});
  }, [editingEventData, isAddUpdateEventModalOpen]);
  //#endregion

  //#region CALENDAR EVENTS
  const calendarEvents = useMemo(() => buildCalendarEvents(eventList), [eventList]);
  const eventsForSelectedDate = useMemo(
    () => getEventsForSelectedDate(eventList, currentDate),
    [currentDate, eventList],
  );
  const filteredEventsForSelectedDate = useMemo(
    () => getFilteredEventsForTab(eventsForSelectedDate, viewActiveTab),
    [eventsForSelectedDate, viewActiveTab],
  );
  //#endregion

  //#region CALLBACKS
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleOpenViewEvent = (event: CalendarEvent) => {
    setCurrentDate(new Date(event.start));
    setIsViewEventModalOpen(true);
  };

  const handleEventTabChange = (tabId: string) => {
    if (tabId === 'Task') {
      navigate('/task');
      return;
    }
    if (tabId === 'Meeting') {
      navigate('/meeting');
      return;
    }
    if (tabId === 'Conference') {
      navigate('/conference');
      return;
    }
    setActiveTab(tabId);
  };
  //#endregion

  //#region EVENT VALIDATION | ADD | UPDATE ACTION
  const handleFieldChange = (
    field: keyof AddUpdateEventRequest,
    value: AddUpdateEventRequest[keyof AddUpdateEventRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddUpdateEventModal = () => {
    setEditingEventData(null);
    setLockedEventType(null);
    setFormData(getInitialEventFormState());
    setErrors({});
    setIsAddUpdateEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsAddUpdateEventModalOpen(false);
    setEditingEventData(null);
    setLockedEventType(null);
    setFormData(getInitialEventFormState());
    setErrors({});

    if (returnTo) {
      const target = returnTo;
      setReturnTo(null);
      navigate(target, { replace: true });
    }
  };

  const validateAddUpdateEventForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (formData.Type === '') newErrors.Type = 'Type is required';
    if (formData.Title === '') newErrors.Title = 'Title is required';
    if (formData.Type?.toUpperCase() !== 'TASK' && formData.Date === '') newErrors.Date = 'Date is required';
    if (formData.Type?.toUpperCase() === 'TASK' && formData.DeadlineDate === '') newErrors.DeadlineDate = 'Deadline Date is required';
    if (formData.Type?.toUpperCase() !== 'TASK' && (!formData.StartTime || formData.StartTime === '00:00')) newErrors.StartTime = 'Start Time is required';
    if (formData.Type?.toUpperCase() !== 'TASK' && (!formData.EndTime || formData.EndTime === '00:00')) newErrors.EndTime = 'End Time is required';
    if (formData.Type?.toUpperCase() !== 'TASK' && formData.Room === '') newErrors.Room = 'Room is required';

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const pushEventFormData = (): FormData => {
    const employeeIdsString = employeeMasterDropdown.selectedValues.length > 0
      ? employeeMasterDropdown.selectedValues.join(',')
      : '';
    const projectIdsString = projectMasterDropdown.selectedValues.length > 0
      ? projectMasterDropdown.selectedValues.join(',')
      : '';

    const fd = new FormData();
    fd.append('EventId', String(formData.EventId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('Type', formData.Type ?? '');
    fd.append('Title', formData.Title ?? '');
    fd.append('ProjectId', projectIdsString ?? '');
    fd.append('DepartmentId', formData.DepartmentId ?? '');
    fd.append('EmployeeId', employeeIdsString ?? '');
    fd.append('Date', formData.Date ?? '');
    fd.append('DeadlineDate', formData.DeadlineDate ?? '');
    fd.append('StartTime', formData.StartTime ?? '');
    fd.append('EndTime', formData.EndTime ?? '');
    fd.append('Room', formData.Room ?? '');
    fd.append('Priority', formData.Priority ?? '');
    fd.append('Description', formData.Description ?? '');

    documentFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('DocumentURL', file);
      }
    });
    fd.append('RemoveDocumentURL', removedDocumentUrls.join(','));
    return fd;
  };

  const handleAddUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddUpdateEventForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = pushEventFormData();
        const response = await EventService.apiCallAddUpdateEvent(payload);

        if (E.isRight(response)) {
          setIsAddUpdateEventModalOpen(false);
          const isAdd = formData.EventId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as EventData;
            setEventList((prevData) => [newRecord, ...prevData]);
            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as EventData;
            setEventList((prevData) =>
              prevData.map((item) => (item.EventId === formData.EventId ? updatedRecord : item)),
            );
            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingEventData(null);
          setLockedEventType(null);
          if (returnTo) {
            const target = returnTo;
            setReturnTo(null);
            navigate(target, { replace: true });
          }
        } else {
          addToast({ type: 'error', title: response.left?.message });
        }

        return response;
      },
      undefined,
      (error: unknown) => {
        const requestError = error as Error;
        addToast({ type: 'error', title: requestError.message });
      },
      undefined,
      Number(formData.EventId) === 0 ? 'Add Event' : 'Update Event',
    );
  };
  //#endregion

  //#region RENDER
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:h-[calc(100dvh-78px)] lg:min-h-[640px] lg:flex-row">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <EventCalendarSidebar
        currentDate={currentDate}
        events={eventsForSelectedDate}
        onDateSelect={handleDateSelect}
        onMonthChange={handleMonthChange}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white p-4">
        <EventCalendarHeader
          currentDate={currentDate}
          activeTab={activeTab}
          view={view}
          onTabChange={handleEventTabChange}
          onViewChange={setView}
          onAdd={handleAddUpdateEventModal}
        />

        <div className="thin-scroll min-h-0 flex-1 overflow-auto rounded-xl bg-white">
          <CustomCalendar
            view={view === 'dayGridMonth' ? 'month' : view === 'timeGridWeek' ? 'week' : 'day'}
            currentDate={currentDate}
            selectedDate={currentDate}
            events={calendarEvents}
            monthVariant="event"
            groupMonthEventsByType
            onDateChange={setCurrentDate}
            onEventClick={handleOpenViewEvent}
          />
        </div>
      </main>

      <AddUpdateEventModal
        isOpen={isAddUpdateEventModalOpen}
        isLoading={isLoading}
        isEditMode={Boolean(editingEventData)}
        formData={formData}
        errors={errors}
        lockedEventType={lockedEventType}
        documentFiles={documentFiles}
        documentURL={documentURL}
        employeeSelectedValues={employeeMasterDropdown.selectedValues}
        employeeOptions={employeeMasterDropdown.initialOptions}
        projectSelectedValues={projectMasterDropdown.selectedValues}
        projectOptions={projectMasterDropdown.initialOptions}
        onClose={handleCloseEventModal}
        onSubmit={handleAddUpdateEvent}
        onFieldChange={handleFieldChange}
        onEmployeesChange={(values) => {
          const { idsString } = employeeMasterDropdown.handleChange(values);
          setSelectedEmployeeValues(idsString || null);
        }}
        onProjectsChange={(values) => {
          const { idsString } = projectMasterDropdown.handleChange(values);
          setSelectedProjectValues(idsString || null);
        }}
        onDocumentFilesChange={setDocumentFiles}
        onRemoveExistingDocument={(url) => {
          setRemovedDocumentUrls((prev) => [...prev, url]);
        }}
      />

      <ViewEventModal
        isOpen={isViewEventModalOpen}
        isLoading={isLoading}
        currentDate={currentDate}
        viewActiveTab={viewActiveTab}
        events={filteredEventsForSelectedDate}
        onClose={() => setIsViewEventModalOpen(false)}
        onTabChange={setViewActiveTab}
        onSubmit={handleAddUpdateEvent}
      />
    </div>
  );
  //#endregion
};

export default Event;
