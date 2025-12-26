import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Loader } from '@/core/utils/loader';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm, formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Button, Input } from '@/ui/components/forms';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Tabs from '@/ui/components/Tab/Tab';
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdateEventRequest, EventData, FilterWithPaginationEventRequest } from '../models/EventModel';
import { eventService } from '../services/EventService';
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast';
import { Modal } from '@/ui/components/Modal/Modal';
import { CONFERENCE_ROOM_NAME, EVENT_TYPE } from '@/core/constants';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { TextArea } from '@/ui/components/forms/Textarea';
import { TimePicker } from '@/ui/components/TimePicker/TimePicker';
import CustomCalendar from '@/ui/components/Calender/CustomCalendar';
import { getWeekDays } from '@/ui/components/Calender/CalendarUtils';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { fetchProjectDropdown } from '@/features/projectMaster/projectDropdown';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

/* ================= TYPES ================= */
type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  textColor?: string;
}

/* ================= VIEW OPTIONS ================= */
const CALENDAR_VIEW_OPTIONS = [
  { id: 'dayGridMonth', name: 'Monthly' },
  { id: 'timeGridWeek', name: 'Weekly' },
  { id: 'timeGridDay', name: 'Daily' }
] as const;

const initialFormState = (): AddUpdateEventRequest => ({
  EventId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  Type: '',
  Title: '',
  ProjectId: '',
  DepartmentId: '',
  EmployeeId: '',
  Date: '',
  DeadlineDate: '',
  StartTime: '',
  EndTime: '',
  Room: '',
  Priority: '',
  Description: '',
  DocumentURL: null,
  RemoveDocumentURL: ''
});


const Event: React.FC = () => {

  //#region STATE
  const [eventList, setEventList] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // ADD UPDATE EDIT EVENT MODAL
  const [isAddUpdateEventModalOpen, setIsAddUpdateEventModalOpen] = useState(false);
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
  const [editingEventData, setEditingEventData] = useState<EventData | null>(null);
  const [formData, setFormData] = useState<AddUpdateEventRequest>(() => initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentUrls, setRemovedDocumentUrls] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();
  const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);

  const employeeMasterDropdown = useMultiSelectDropdown({
    value: selectedEmployeeValues,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  const [selectedProjectValues, setSelectedProjectValues] = useState<string | number | null>(null);

  const projectMasterDropdown = useMultiSelectDropdown({
    value: selectedProjectValues,
    fetchCallback: fetchProjectDropdown,
    autoFetchOptions: true,
  });

  //#endregion

  const { addToast } = useToast();

  //#region TABS
  const eventTabList = [
    { id: 'All', label: 'All' },
    { id: 'Task', label: 'Task' },
    { id: 'Meeting', label: 'Meeting' },
    { id: 'Conference', label: 'Conference' }
  ];
  const [activeTab, setActiveTab] = useState('All');
  const [ViewActiveTab, setViewActiveTab] = useState('All');
  //#endregion

  //#region CALENDAR
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('dayGridMonth');
  const mappedView =
    view === "dayGridMonth" ? "month" :
      view === "timeGridWeek" ? "week" :
        "day";

  //#endregion

  /* ================= MONTH RANGE HELPERS ================= */

  const getMonthDateRange = (date: Date) => {
    const fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return { fromDate, toDate };
  };

  //#region INITIAL LOAD
  useEffect(() => {
    loadEvent();
  }, [activeTab, currentDate]);

  useEffect(() => {
    if (isAddUpdateEventModalOpen) {
      if (editingEventData) {
        setFormData({
          EventId: editingEventData.EventId,
          Uniquekey: editingEventData.Uniquekey || initialFormState().Uniquekey,
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
          Description: editingEventData.Description || ''
        });
        setDocumentFiles([]);
        setDocumentURL(editingEventData.DocumentURL);
        setRemovedDocumentUrls([]);



      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateEventModalOpen, isAddUpdateEventModalOpen]);
  //#endregion


  //#region API CALL
  const loadEvent = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const { fromDate, toDate } = getMonthDateRange(currentDate);
        const params: FilterWithPaginationEventRequest = {
          EventId: 0,
          FromDate: fromDate.toISOString(),
          ToDate: toDate.toISOString(),
          Type: activeTab === 'All' ? '' : activeTab
        };

        const response = await eventService.apiCallPullEvent(params);

        if (E.isRight(response)) {
          setEventList(response.right.Data);
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
      'Loading Event'
    );
  };
  //#endregion

  /* ================= MAP API → FULLCALENDAR ================= */
  /* ---------- SYNC LEFT MINI CALENDAR ---------- */
  const handleDayPickerSelect = (date?: Date) => {
    if (!date) return;
    setCurrentDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    loadEvent();
  };

  /* ---------- MAP API → CUSTOM EVENTS ---------- */
  const buildEventDateTime = (date?: string | null, time?: string | null) => {
    if (!date) return null;

    // If time exists → merge date + time
    if (time) {
      return `${date.split('T')[0]}T${time}:00`;
    }

    // Otherwise use date only (all-day)
    return date;
  };


  const calendarEvents: CalendarEvent[] = eventList
    .map(ev => {
      const start = buildEventDateTime(ev.Type?.toUpperCase() === "TASK" ? ev.DeadlineDate : ev.Date, ev.Type?.toUpperCase() === "TASK" ? "" : ev.StartTime);
      const end = buildEventDateTime(ev.Type?.toUpperCase() === "TASK" ? ev.DeadlineDate : ev.Date, ev.Type?.toUpperCase() === "TASK" ? "" : ev.EndTime);

      if (!start) return null;

      return {
        id: String(ev.EventId),
        type: ev.Type,
        title: ev.Title,
        start: start,
        end: end,
        description: ev.Description,
        fullname: ev.FullName,
        projectName: ev.ProjectName,
        priority: ev.Priority,
        CreatedBy: ev.CreatedBy,
        CreatedDate: ev.CreatedDate,
      };
    })
    .filter(Boolean) as CalendarEvent[];

  /* ---------- EVENTS FOR LEFT PANEL ---------- */
  const eventsForSelectedDate = eventList.filter(ev => {
    const d =
      ev.Type?.toUpperCase() === "TASK"
        ? ev.DeadlineDate?.slice(0, 10)
        : ev.Date?.slice(0, 10);

    return d === currentDate.toISOString().slice(0, 10);
  });
  //#endregion


  //#region ADD UPDATE EDIT DEPARTMENT MASTER

  const handleFieldChange = (field: keyof AddUpdateEventRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddUpdateEventModal = () => {
    setEditingEventData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateEventModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddUpdateEventForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.Type === "") {

      newErrors.Type = "Type is required"
    }

    if (formData.Title === "") {

      newErrors.Title = "Title is required"
    }

    if (formData.Type?.toUpperCase() !== "TASK" && formData.Date === "") {
      newErrors.Date = "Date is required"
    }

    if (formData.Type?.toUpperCase() === "TASK" && formData.DeadlineDate === "") {
      newErrors.DeadlineDate = "Deadline Date is required"
    }

    if (formData.Type?.toUpperCase() !== "TASK" && (!formData.StartTime || formData.StartTime === "00:00")) {
      newErrors.StartTime = "Start Time is required"
    }

    if (formData.Type?.toUpperCase() !== "TASK" && (!formData.EndTime || formData.EndTime === "00:00")) {
      newErrors.EndTime = "End Time is required"
    }

    if (formData.Type?.toUpperCase() !== "TASK" && formData.Room === "") {
      newErrors.Room = "Room is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushEventFormData = (): FormData => {


    const employeeIdsString = employeeMasterDropdown.selectedValues.length > 0
      ? employeeMasterDropdown.selectedValues.join(',')
      : '';

    const projectIdsString = projectMasterDropdown.selectedValues.length > 0
      ? projectMasterDropdown.selectedValues.join(',')
      : '';

    const fd = new FormData();

    fd.append("EventId", String(formData.EventId ?? 0));
    fd.append("Uniquekey", formData.Uniquekey ?? "");
    fd.append("Type", formData.Type ?? "");
    fd.append("Title", formData.Title ?? "");
    fd.append("ProjectId", projectIdsString ?? "");
    fd.append("DepartmentId", formData.DepartmentId ?? "");
    fd.append("EmployeeId", employeeIdsString ?? "");
    fd.append("Date", formData.Date ?? "");                // yyyy-MM-dd
    fd.append("DeadlineDate", formData.DeadlineDate ?? "");
    fd.append("StartTime", formData.StartTime ?? "");      // HH:mm
    fd.append("EndTime", formData.EndTime ?? "");
    fd.append("Room", formData.Room ?? "");
    fd.append("Priority", formData.Priority ?? "");
    fd.append("Description", formData.Description ?? "");

    documentFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('DocumentURL', file);
      }
    });
    fd.append('RemoveDocumentURL', removedDocumentUrls.join(','));
    return fd;
  };

  const handleAddUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddUpdateEventForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushEventFormData();

        const response = await eventService.apiCallAddUpdateEvent(payload);

        if (E.isRight(response)) {

          setIsAddUpdateEventModalOpen(false);

          const isAdd = formData.EventId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as EventData

            setEventList(prevData => [newRecord, ...prevData]);


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as EventData;

            setEventList(prevData =>
              prevData.map(item =>
                item.EventId === formData.EventId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingEventData(null);
        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(formData.EventId) === 0 ? 'Add Event' : 'Update Event'
    )

  };

  //#endregion

  //#region VIEW EVENT MODAL FILTER AS PER TAB CHNAGE

  const filteredEventsForSelectedDate = eventsForSelectedDate.filter(ev => {
    if (ViewActiveTab === "All") return true;
    return ev.Type?.toUpperCase() === ViewActiveTab.toUpperCase();
  });
  //#endregion



  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      {/* LEFT */}
      <aside className="p-4">
        <div className="p-4 bg-blue-50 rounded-lg">

          {mappedView === "month" && (
            <DayPicker
              mode="single"
              selected={currentDate}
              month={currentDate}
              onSelect={handleDayPickerSelect}
              onMonthChange={handleMonthChange}
            />
          )}

          {mappedView === "week" && (
            <div className="space-y-2">


              <div className="flex items-center justify-between">
                <Button
                  size='sm'
                  color='transparent'
                  onClick={() =>
                    setCurrentDate(prev => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() - 7);
                      return d;
                    })
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="font-semibold text-sm">
                  {getWeekDays(currentDate)[0].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                  {" - "}
                  {getWeekDays(currentDate)[6].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                </div>

                <Button
                  size='sm'
                  color='transparent'
                  onClick={() =>
                    setCurrentDate(prev => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() + 7);
                      return d;
                    })
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* WEEK GRID */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {getWeekDays(currentDate).map(d => (
                  <button
                    key={d.toISOString()}
                    className={`p-2 rounded-lg text-sm 
                        ${d.toDateString() === currentDate.toDateString()
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                      }`}
                    onClick={() => handleDayPickerSelect(d)}
                  >
                    <div className="font-medium">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div>{d.getDate()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}


          {mappedView === "day" && (
            <div className="p-4 rounded-lg text-center border space-y-2">

              {/* HEADER WITH DAY NAVIGATION */}
              <div className="flex items-center justify-between">
                <Button
                  size='sm'
                  color='transparent'
                  onClick={() =>
                    setCurrentDate(prev => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() - 1);
                      return d;
                    })
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="p-5 font-semibold text-sm">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>

                <Button
                  size='sm'
                  color='transparent'
                  onClick={() =>
                    setCurrentDate(prev => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() + 1);
                      return d;
                    })
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* BIG DATE */}
              <div className="text-3xl font-medium">
                {currentDate.getDate()}
              </div>

            </div>
          )}

        </div>

        {/* SELECTED DATE TITLE */}
        <div className="mt-4 font-semibold text-sm">
          {formatDate_dd_MonthName_yy(currentDate)}
        </div>

        {/* EVENT LIST */}
        <div className="mt-2 rounded-lg p-3 space-y-2 bg-white">

          {eventsForSelectedDate.length === 0 && (
            <div className="text-xs text-gray-400">
              No events for this day
            </div>
          )}

          {eventsForSelectedDate.map(ev => (
            <div
              key={ev.EventId}
              className="flex justify-between items-center text-xs pb-1"
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      ev.Type?.toUpperCase() === "TASK"
                        ? "#2563eb"
                        : ev.Type?.toUpperCase() === "MEETING"
                          ? "#ef4444"
                          : "#f97316"
                  }}
                />
                {ev.Type} {ev.Title}
              </span>

              <span className="text-gray-400">
                2hrs
              </span>
            </div>
          ))}

        </div>

      </aside>

      {/* RIGHT */}
      <div className="flex-1 p-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="font-semibold text-blue-600 text-[22px]">
            {formatDate_MonthName_yy(currentDate)}
          </h2>

          <div className="flex items-center gap-3">
            <Tabs
              tabs={eventTabList}
              defaultActive={activeTab === '' ? '' : activeTab}
              islarge
              onTabChange={(tab) => setActiveTab(tab.id)}
            />

            <div className="min-w-[160px]">
              <SinglePageSelection
                value={view}
                onChange={(val) =>
                  setView(val as CalendarView)
                }
                options={CALENDAR_VIEW_OPTIONS.map(opt => ({
                  label: opt.name,
                  value: opt.id
                }))}
              />
            </div>

            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              color="blue"
              size="mxs"
              variant="solid"
              colorMode="gradient_dark"
              style={{ width: 125 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAddUpdateEventModal()
              }}
            >
              Add
            </Button>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="bg-white rounded-xl">
          <CustomCalendar
            view={
              view === "dayGridMonth" ? "month"
                : view === "timeGridWeek" ? "week"
                  : "day"
            }
            currentDate={currentDate}
            events={calendarEvents}
            onDateChange={(date) => {
              setCurrentDate(date);
              setIsViewEventModalOpen(true);
            }}
          />
        </div>
      </div>

      {/*  ADD EDIT UPDATE EVENT MODAL */}
      <Modal
        isOpen={isAddUpdateEventModalOpen}
        onClose={() => {
          setIsAddUpdateEventModalOpen(false);
          setEditingEventData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateEventModalOpen(false);
          setEditingEventData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingEventData ? 'Update' : 'Add'}
        onSubmit={handleAddUpdateEvent}
        saveText={'Save'}
        resetText='Reset'
        loading={isLoading}
        size='md'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formData.Type}
                onChange={(e) => handleFieldChange('Type', String(e))}
                options={EVENT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.Type}
              />
            </div>
            <div>
              <Input
                label='Title'
                required
                error={errors.Title}
                type="text"
                value={formData.Title}
                maxLength={50}
                onChange={(e) => handleFieldChange('Title', e.target.value)}
                placeholder="Enter Title"
              />

            </div>
            {formData.Type?.toUpperCase() === "TASK" ?
              <div>
                <DatePickerInput
                  label="Deadline Date"
                  value={formatDate_dd_mm_yyyy(formData.DeadlineDate)}
                  onChange={(val) => handleFieldChange('DeadlineDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={errors.DeadlineDate}

                />

              </div>
              : ""}
            {formData.Type?.toUpperCase() !== "TASK" ?
              <>
                <div>
                  <DatePickerInput
                    label="Date"
                    value={formatDate_dd_mm_yyyy(formData.Date)}
                    onChange={(val) => handleFieldChange('Date', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                    required
                    error={errors.Date}

                  />

                </div>
                <div>
                  <TimePicker
                    label="Start Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.StartTime || ""}
                    onChange={(val) => handleFieldChange("StartTime", val)}
                    error={errors.StartTime}
                  />
                </div>
                <div>
                  <TimePicker
                    label="End Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.EndTime || ""}
                    onChange={(val) => handleFieldChange("EndTime", val)}
                    error={errors.EndTime}
                  />
                </div>
              </>
              : ''}
            <div>

              <MultiSelectPagination
                label="Add Employee"
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                selectedValues={employeeMasterDropdown.selectedValues}
                options={employeeMasterDropdown.initialOptions}
                onChange={(values) => {
                  const { idsString } = employeeMasterDropdown.handleChange(values);
                  setSelectedEmployeeValues(idsString || null);
                  if (errors.DesignationId) {
                    setErrors((prev) => ({ ...prev, DesignationId: '' }));
                  }
                }}
              />

            </div>
            {formData.Type?.toUpperCase() !== "TASK" ?
              <div>
                <SinglePageSelection
                  label="Room"
                  required
                  value={formData.Room}
                  onChange={(e) => handleFieldChange('Room', String(e))}
                  options={CONFERENCE_ROOM_NAME.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.Room}
                />
              </div>
              : ""}

            <div>

              <MultiSelectPagination
                label="Add Project"
                dataFetchCallBack={fetchProjectDropdown}
                selectedValues={projectMasterDropdown.selectedValues}
                options={projectMasterDropdown.initialOptions}
                onChange={(values) => {
                  const { idsString } = projectMasterDropdown.handleChange(values);
                  setSelectedProjectValues(idsString || null);
                  if (errors.DesignationId) {
                    setErrors((prev) => ({ ...prev, DesignationId: '' }));
                  }
                }}
              />

            </div>
            <div>
              <MultiFilePicker
                label="Document"
                required
                error={errors.DocumentURL}
                value={documentFiles}
                onChange={setDocumentFiles}
                availableFilesURL={documentURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemovedDocumentUrls((prev) => [...prev, url])
                }}
              />
            </div>

            <div>
              <TextArea
                label="Remark"
                className='thin-scroll'
                value={formData.Description}
                onChange={(e) => handleFieldChange("Description", e.target.value)}
                error={errors.Description} />
            </div>


          </div>
        </div>
      </Modal>

      {/*  VIEW EVENT MODAL */}
      <Modal
        isOpen={isViewEventModalOpen}
        onClose={() => {
          setIsViewEventModalOpen(false);
        }}
        onCancel={() => {
          setIsViewEventModalOpen(false);
        }}
        title={formatDate_dd_MonthName_yy(currentDate.toISOString().slice(0, 10))}
        onSubmit={handleAddUpdateEvent}
        loading={isLoading}
        size='xxl'
      >
        <div className="space-y-3">
          <Tabs
            tabs={eventTabList}
            defaultActive={ViewActiveTab === '' ? '' : ViewActiveTab}
            islarge
            onTabChange={(tab) => setViewActiveTab(tab.id)}
          />

          {filteredEventsForSelectedDate.length === 0 && (
            <div className="text-xs text-gray-400">
              <NoDataView message='No events for this day' />
            </div>
          )}

          {filteredEventsForSelectedDate.map(ev => (

            <div
              key={ev.EventId}
              className='text-xs p-3 rounded-lg bg-gray-100'>
              <div className="flex items-start justify-between gap-4">

                {/* LEFT — dot + title */}
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        ev.Type?.toUpperCase() === "TASK"
                          ? "#2563eb"
                          : ev.Type?.toUpperCase() === "MEETING"
                            ? "#ef4444"
                            : "#f97316"
                    }}
                  />
                  {ev.Title}
                </span>

                {/* RIGHT — deadline */}
                {ev.Type?.toUpperCase() === "TASK" ?
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Deadline : {formatDate_dd_MonthName_yy(ev.DeadlineDate || "-")}
                  </span>
                  :
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Date : {formatDate_dd_MonthName_yy(ev.Date || "-")}
                  </span>
                }

              </div>

              <div className='pb-2'>
                {ev.Description?.trim() || "-"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                    {ev.FullName && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 16px 1fr',
                        gap: 8,
                        alignItems: 'start',
                        width: '100%'
                      }}>
                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                          {ev.Type}  Member
                        </div>
                        <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>

                        <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
                          <ul className="list-disc ml-4 text-[11px]">
                            {ev.FullName.split(',').map(name => name.trim()).filter(name => name !== "")
                              .map((name, i) => (
                                <li key={i}>{name}</li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    )}
                    {ev.ProjectName && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 16px 1fr',
                        gap: 8,
                        alignItems: 'start',
                        width: '100%'
                      }}>
                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                          Project Name
                        </div>
                        <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>

                        <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
                          <ul className="list-disc ml-4 text-[11px]">
                            {ev.ProjectName.split(',').map(name => name.trim()).filter(name => name !== "")
                              .map((name, i) => (
                                <li key={i}>{name}</li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FieldItem label={`${ev.Type} Assigned By`} isRow value={ev.CreatedBy} />
                  <FieldItem label={`${ev.Type}  Assigned Date`} isRow value={formatDate_dd_MonthName_yy_hh_mm(ev.CreatedDate ?? '-')} />
                  {ev.Type!=='Task' ?
                  <FieldItem label={`${ev.Type} Time`} isRow value={ev.StartTime +'- '+ ev.EndTime } /> : ""}
                 
                </div>
                {ev.DocumentURL && (
                  <FieldItem
                    label=""
                    value="Document"
                    urls={ev.DocumentURL}
                    isSetValue={true}
                    isIcon={false}
                  />
                )}
              </div>
            </div>


          ))}
        </div>
      </Modal >
    </div >
  );
};

export default Event;
