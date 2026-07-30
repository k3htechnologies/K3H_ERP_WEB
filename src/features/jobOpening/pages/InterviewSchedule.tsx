import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, Clock3, MoreVertical, UserRound } from "lucide-react";
import * as E from "fp-ts/Either";
import CustomCalendar from "@/ui/components/Calender/CustomCalendar";
import type { CalendarEvent } from "@/ui/components/Calender/CalendarEvent";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import SimpleDataTable, {
  type SimpleDataTableColumn,
} from "@/ui/components/DataTable/SimpleDataTable";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { TextArea } from "@/ui/components/forms/Textarea";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { useToast } from "@/core/hooks/useToast";
import { jobOpeningService } from "../services/JobOpeningService";
import type { ScheduleInterviewRequest } from "../models/JobOpeningModel";
import { DEFAULT_REMARK_UNIQUE_KEY } from "../utils/candidateApplication";
import { isValidInterviewRecord, mapApiToInterview, toInterviewDateTimeIso, type InterviewItem } from "../utils/interviewSchedule";

type CalendarView = "month" | "week" | "day";

interface RouteCandidate {
  id?: string | number;
  candidateId?: number;
  jobOpeningMasterId?: number;
  name?: string;
  role?: string;
}

interface ScheduleFormState {
  candidate: string;
  position: string;
  interviewerId: string;
  date: string;
  startTime: string;
  stage: string;
  attachmentUrl: string;
  remarks: string;
}

interface ScheduleFormErrors {
  candidate?: string;
  position?: string;
  interviewer?: string;
  date?: string;
  startTime?: string;
  stage?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const TODAY_PREVIEW_COUNT = 3;
const INTERVIEW_PAGE_SIZE = 10;
const TODAY_INTERVIEW_PAGE_SIZE = 100;
const CALENDAR_SCROLL_THRESHOLD = 60;

const toDateInputValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const combineDateAndTime = (date: Date, time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const formatMonthYear = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const isSameCalendarDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatSelectedDateHeading = (date: Date) =>
  `Interviews - ${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)}`;

const formatPipelineDate = (date: Date, startTime: string) => {
  const dateWithTime = combineDateAndTime(date, startTime);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(dateWithTime)
    .replace(",", ", ");
};

const formatTimeLabel = (time: string) => {
  const [hourValue = 0, minuteValue = 0] = time.split(":").map(Number);
  const date = new Date(2026, 0, 1, hourValue, minuteValue);

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "NA";

const getTotalRecords = (response: unknown): number | null => {
  if (!response || typeof response !== "object") return null;

  const result = response as {
    TotalNumberOfRecord?: unknown;
    totalNumberOfRecord?: unknown;
  };
  const totalRecords = Number(result.TotalNumberOfRecord ?? result.totalNumberOfRecord);

  return Number.isFinite(totalRecords) ? totalRecords : null;
};

const mergeInterviews = (current: InterviewItem[], incoming: InterviewItem[]) => {
  const merged = [...current];
  const indexes = new Map(current.map((item, index) => [item.uniqueKey || `interview-${item.id}`, index]));

  incoming.forEach((item) => {
    const key = item.uniqueKey || `interview-${item.id}`;
    const existingIndex = indexes.get(key);

    if (existingIndex === undefined) {
      indexes.set(key, merged.length);
      merged.push(item);
    } else {
      merged[existingIndex] = item;
    }
  });

  return merged;
};

export const InterviewSchedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const passedCandidate = (location.state?.candidate || null) as RouteCandidate | null;
  const candidateId = Number(searchParams.get("candidateId") || passedCandidate?.candidateId || passedCandidate?.id || 0);
  const jobOpeningMasterId = Number(passedCandidate?.jobOpeningMasterId || 0);
  const { addToast } = useToast();
  const todayListHasScrolledRef = useRef(false);
  const calendarRequestInFlightRef = useRef(false);
  const calendarHasMoreRef = useRef(true);
  const calendarPageRef = useRef(1);
  const calendarAbortControllerRef = useRef<AbortController | null>(null);

  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const visibleMonth = currentDate.getMonth() + 1;
  const visibleYear = currentDate.getFullYear();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [todaysInterviews, setTodaysInterviews] = useState<InterviewItem[]>([]);
  const [isTodayListExpanded, setIsTodayListExpanded] = useState(false);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [isFetchingMoreInterviews, setIsFetchingMoreInterviews] = useState(false);
  const [isLoadingTodaysInterviews, setIsLoadingTodaysInterviews] = useState(false);
  const [hasMoreInterviews, setHasMoreInterviews] = useState(true);
  const [interviewError, setInterviewError] = useState("");
  const [todayInterviewError, setTodayInterviewError] = useState("");
  const [interviewRefreshKey, setInterviewRefreshKey] = useState(0);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [isSavingInterview, setIsSavingInterview] = useState(false);
  const [errors, setErrors] = useState<ScheduleFormErrors>({});
  const [formData, setFormData] = useState<ScheduleFormState>({
    candidate: passedCandidate?.name || "",
    position: passedCandidate?.role || "",
    interviewerId: "",
    date: toDateInputValue(selectedDate),
    startTime: "10:00",
    stage: "Interview",
    attachmentUrl: "",
    remarks: "",
  });
  const interviewerDropdown = useMultiSelectDropdown({
    value: formData.interviewerId,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  const loadCalendarInterviews = useCallback(async (month: number, year: number, pageNumber: number, signal?: AbortSignal) => {
    if (signal?.aborted || calendarRequestInFlightRef.current) return;

    calendarRequestInFlightRef.current = true;
    if (pageNumber === 1) {
      setIsLoadingInterviews(true);
      setInterviewError("");
    } else {
      setIsFetchingMoreInterviews(true);
    }

    try {
      const response = await jobOpeningService.apiCallPullCandidateInterviews(
        {
          PageSize: INTERVIEW_PAGE_SIZE,
          PageNumber: pageNumber,
          Month: month,
          Year: year,
        },
        { signal },
      );

      if (signal?.aborted) return;

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setInterviewError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to load interviews.",
        );
        return;
      }

      const records = response.right.Data ?? [];
      const recordOffset = (pageNumber - 1) * INTERVIEW_PAGE_SIZE;
      const mappedInterviews = records.filter(isValidInterviewRecord).map((item, index) => mapApiToInterview(item, recordOffset + index));
      const totalRecords = getTotalRecords(response.right);
      const loadedRecordCount = recordOffset + records.length;
      const canLoadMore = totalRecords === null ? records.length === INTERVIEW_PAGE_SIZE : loadedRecordCount < totalRecords;

      setInterviews((previous) => (pageNumber === 1 ? mappedInterviews : mergeInterviews(previous, mappedInterviews)));
      calendarPageRef.current = pageNumber;
      calendarHasMoreRef.current = canLoadMore;
      setHasMoreInterviews(canLoadMore);
    } catch (error: unknown) {
      if (!signal?.aborted) {
        setInterviewError(error instanceof Error ? error.message : "Unable to load interviews.");
      }
    } finally {
      if (!signal?.aborted) {
        calendarRequestInFlightRef.current = false;
        setIsLoadingInterviews(false);
        setIsFetchingMoreInterviews(false);
      }
    }
  }, []);

  useEffect(() => {
    calendarAbortControllerRef.current?.abort();
    const controller = new AbortController();
    calendarAbortControllerRef.current = controller;
    calendarRequestInFlightRef.current = false;
    calendarHasMoreRef.current = true;
    calendarPageRef.current = 1;
    setInterviews([]);
    setHasMoreInterviews(true);
    void loadCalendarInterviews(visibleMonth, visibleYear, 1, controller.signal);

    return () => controller.abort();
  }, [visibleMonth, visibleYear, interviewRefreshKey, loadCalendarInterviews]);

  const loadSelectedDateInterviews = useCallback(async (date: Date, signal?: AbortSignal) => {
    if (signal?.aborted) return;

    setIsLoadingTodaysInterviews(true);
    setTodayInterviewError("");
    setTodaysInterviews([]);

    try {
      const response = await jobOpeningService.apiCallPullCandidateInterviews(
        {
          PageSize: TODAY_INTERVIEW_PAGE_SIZE,
          PageNumber: 1,
          InterviewDate: toDateInputValue(date),
        },
        { signal },
      );

      if (signal?.aborted) return;

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setTodayInterviewError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to load interviews for the selected date.",
        );
        return;
      }

      const mappedInterviews = (response.right.Data ?? [])
        .filter(isValidInterviewRecord)
        .map(mapApiToInterview)
        .filter((item) => isSameCalendarDate(item.date, date))
        .sort((first, second) => first.startTime.localeCompare(second.startTime));

      setTodaysInterviews(mappedInterviews);
    } catch (error: unknown) {
      if (!signal?.aborted) {
        setTodayInterviewError(error instanceof Error ? error.message : "Unable to load interviews for the selected date.");
      }
    } finally {
      if (!signal?.aborted) setIsLoadingTodaysInterviews(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    todayListHasScrolledRef.current = false;
    setIsTodayListExpanded(false);
    void loadSelectedDateInterviews(selectedDate, controller.signal);
    return () => controller.abort();
  }, [interviewRefreshKey, loadSelectedDateInterviews, selectedDate]);

  const pipelineInterviews = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return interviews
      .filter((item) => combineDateAndTime(item.date, item.startTime).getTime() >= tomorrow.getTime())
      .sort(
        (first, second) =>
          combineDateAndTime(first.date, first.startTime).getTime() - combineDateAndTime(second.date, second.startTime).getTime(),
      );
  }, [interviews]);

  const pipelineColumns = useMemo<
    SimpleDataTableColumn<InterviewItem>[]
  >(
    () => [
      {
        key: "candidate",
        header: "Candidate",
        render: (item) => (
          <div className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                item.eventColor === "orange"
                  ? "bg-[#FFE4D7] text-[#94452B]"
                  : item.eventColor === "green"
                    ? "bg-[#DCFCE7] text-[#168348]"
                    : "bg-[#DDEAFF] text-[#4770A5]"
              }`}
            >
              {getInitials(item.candidate)}
            </span>
            <span className="align-middle text-[16px] font-normal not-italic leading-[100%] tracking-[0px] text-slate-700">
              {item.candidate}
            </span>
          </div>
        ),
      },
      {
        key: "position",
        header: "Position",
        render: (item) => item.position,
      },
      {
        key: "interviewer",
        header: "Interviewer",
        render: (item) => item.interviewer,
      },
      {
        key: "dateTime",
        header: "Date & Time",
        render: (item) =>
          formatPipelineDate(item.date, item.startTime),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (item) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              item.status === "Completed"
                ? "bg-emerald-50 text-emerald-700"
                : item.status === "Cancelled"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#EEF3FC] text-[#55708C]"
            }`}
          >
            {item.status}
          </span>
        ),
      },
    ],
    [],
  );

  const isSelectedDateToday = isSameCalendarDate(selectedDate, new Date());
  const selectedDateHeading = isSelectedDateToday
    ? "Upcoming Today"
    : formatSelectedDateHeading(selectedDate);

  const visibleTodaysInterviews = useMemo(
    () =>
      !isSelectedDateToday || isTodayListExpanded
        ? todaysInterviews
        : todaysInterviews.slice(0, TODAY_PREVIEW_COUNT),
    [isSelectedDateToday, isTodayListExpanded, todaysInterviews],
  );

  const handleViewMoreToday = () => {
    todayListHasScrolledRef.current = false;
    setIsTodayListExpanded(true);
  };

  const handleTodayListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!isSelectedDateToday || !isTodayListExpanded) return;

    const scrollTop = event.currentTarget.scrollTop;
    if (scrollTop > 4) {
      todayListHasScrolledRef.current = true;
      return;
    }

    if (todayListHasScrolledRef.current) {
      todayListHasScrolledRef.current = false;
      setIsTodayListExpanded(false);
    }
  };

  const handleCalendarScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + CALENDAR_SCROLL_THRESHOLD;

    if (!isNearBottom || !calendarHasMoreRef.current || calendarRequestInFlightRef.current) {
      return;
    }

    void loadCalendarInterviews(visibleMonth, visibleYear, calendarPageRef.current + 1, calendarAbortControllerRef.current?.signal);
  };

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      interviews.map((item) => ({
        id: item.id,
        type: "MEETING",
        title: `${formatTimeLabel(item.startTime)} - ${item.candidate}`,
        color: item.eventColor,
        start: `${toDateInputValue(item.date)}T${item.startTime}:00`,
        end: `${toDateInputValue(item.date)}T${item.endTime}:00`,
        description: item.remarks,
        fullname: item.interviewer,
        CreatedBy: item.interviewer,
        CreatedDate: toDateInputValue(item.date),
      })),
    [interviews],
  );

  const handlePreviousPeriod = () => {
    setCurrentDate((previous) => {
      const next = new Date(previous);
      if (calendarView === "day") next.setDate(next.getDate() - 1);
      else if (calendarView === "week") next.setDate(next.getDate() - 7);
      else return new Date(next.getFullYear(), next.getMonth() - 1, 1);
      return next;
    });
  };

  const handleNextPeriod = () => {
    setCurrentDate((previous) => {
      const next = new Date(previous);
      if (calendarView === "day") next.setDate(next.getDate() + 1);
      else if (calendarView === "week") next.setDate(next.getDate() + 7);
      else return new Date(next.getFullYear(), next.getMonth() + 1, 1);
      return next;
    });
  };

  const openNewScheduleModal = () => {
    setEditingInterviewId(null);
    setErrors({});
    setFormData({
      candidate: passedCandidate?.name || "",
      position: passedCandidate?.role || "",
      interviewerId: "",
      date: toDateInputValue(selectedDate),
      startTime: "10:00",
      stage: "Interview",
      attachmentUrl: "",
      remarks: "",
    });
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (item: InterviewItem) => {
    setEditingInterviewId(item.id);
    setErrors({});
    setFormData({
      candidate: item.candidate,
      position: item.position,
      interviewerId: item.interviewerId,
      date: toDateInputValue(item.date),
      startTime: item.startTime,
      stage: item.stage,
      attachmentUrl: item.attachmentUrl,
      remarks: item.remarks,
    });
    setIsScheduleModalOpen(true);
  };

  const handleCalendarDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const handleCalendarEventClick = (calendarEvent: CalendarEvent) => {
    const item = interviews.find((interview) => interview.id === Number(calendarEvent.id));
    if (item) {
      setSelectedDate(item.date);
      setCurrentDate(item.date);
      openEditScheduleModal(item);
    }
  };

  const updateFormField = <K extends keyof ScheduleFormState>(field: K, value: ScheduleFormState[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (errors[field as keyof ScheduleFormErrors]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: ScheduleFormErrors = {};

    if (!candidateId || !formData.candidate.trim()) {
      nextErrors.candidate = "A valid candidate is required";
    }
    if (!jobOpeningMasterId) {
      nextErrors.position = "A valid job opening is required";
    }
    if (!formData.interviewerId) {
      nextErrors.interviewer = "Select at least one interviewer";
    }
    if (!formData.date) nextErrors.date = "Interview date is required";
    if (!formData.startTime) {
      nextErrors.startTime = "Interview time is required";
    }
    if (!formData.stage.trim()) nextErrors.stage = "Stage is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const editingInterview = interviews.find((item) => item.id === editingInterviewId);
    const interviewDate = new Date(`${formData.date}T${formData.startTime}:00`);
    const request: ScheduleInterviewRequest = {
      InterviewId: editingInterviewId || 0,
      UniqueKey: editingInterview?.uniqueKey || DEFAULT_REMARK_UNIQUE_KEY,
      CandidateId: editingInterview?.candidateId || candidateId,
      JobOpeningMasterId: editingInterview?.jobOpeningMasterId || jobOpeningMasterId,
      Stage: formData.stage.trim(),
      InterviewPanel: formData.interviewerId,
      InterviewDate: toInterviewDateTimeIso(formData.date, formData.startTime),
      InterviewTime: formData.startTime,
      AttachmentUrl: formData.attachmentUrl.trim(),
      Remarks: formData.remarks.trim(),
    };

    setIsSavingInterview(true);

    try {
      const response = await jobOpeningService.apiCallScheduleInterview(request);

      if (E.isLeft(response) || !response.right.IsSuccess) {
        addToast({
          type: "error",
          title: E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to schedule interview.",
        });
        return;
      }

      addToast({
        type: "success",
        title: editingInterviewId ? "Interview updated successfully." : "Interview scheduled successfully.",
      });
      setSelectedDate(interviewDate);
      setCurrentDate(interviewDate);
      setIsScheduleModalOpen(false);
      setInterviewRefreshKey((current) => current + 1);
    } finally {
      setIsSavingInterview(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="mb-5">
          <div className="[&_h2]:align-middle [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:leading-[140%] [&_h2]:tracking-[0.01em]">
            <HeaderActionBar
              titleText="Schedule Interview"
              onCancel={() => navigate(-1)}
              canAction
              EditText="Schedule Interview"
              onEdit={openNewScheduleModal}
              isLoading={isSavingInterview}
            />
          </div>
        </div>

        {(isLoadingInterviews || isLoadingTodaysInterviews) && (
          <p className="mb-3 text-xs font-medium text-blue-600">Loading interviews...</p>
        )}
        {interviewError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{interviewError}</p>}
        {todayInterviewError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{todayInterviewError}</p>}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,1fr)]">
          <section className="flex h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="min-w-[86px] text-base font-semibold text-slate-800 sm:text-lg">{formatMonthYear(currentDate)}</h2>
                <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                  <Button
                    type="button"
                    onClick={handlePreviousPeriod}
                    aria-label="Previous period"
                    color="transparent"
                    size="xs"
                    defineWidth
                    className="flex h-7 w-7 items-center justify-center border-r border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    style={{ height: 28, width: 28, padding: 0, borderRadius: 0 }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextPeriod}
                    aria-label="Next period"
                    color="transparent"
                    size="xs"
                    defineWidth
                    className="flex h-7 w-7 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                    style={{ height: 28, width: 28, padding: 0, borderRadius: 0 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 rounded-md bg-[#F1F3FA] p-0.5 text-xs font-medium text-slate-500">
                {(["month", "week", "day"] as CalendarView[]).map((view) => (
                  <Button
                    key={view}
                    type="button"
                    onClick={() => setCalendarView(view)}
                    color="transparent"
                    size="xs"
                    className={`min-w-[58px] rounded px-3 py-1.5 capitalize transition ${
                      calendarView === view ? "bg-[#1E5BEA] text-white shadow-sm" : "hover:!bg-white/60"
                    }`}
                    style={{
                      height: "auto",
                      padding: "6px 12px",
                      backgroundColor: calendarView === view ? "#1E5BEA" : "transparent",
                      color: calendarView === view ? "#FFFFFF" : "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
                    }}
                  >
                    {view}
                  </Button>
                ))}
              </div>
            </div>

            <div
              onScroll={handleCalendarScroll}
              className="min-h-0 flex-1 overflow-y-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <CustomCalendar
                view={calendarView}
                currentDate={currentDate}
                events={calendarEvents}
                onDateChange={handleCalendarDateChange}
                onEventClick={handleCalendarEventClick}
              />
              {isFetchingMoreInterviews && <p className="py-3 text-center text-xs font-medium text-blue-600">Loading more interviews...</p>}
              {!hasMoreInterviews && interviews.length > INTERVIEW_PAGE_SIZE && (
                <p className="py-3 text-center text-xs text-slate-400">All interviews loaded</p>
              )}
            </div>
          </section>

          <aside className="flex h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="align-middle text-lg font-semibold leading-7 tracking-normal text-slate-800">
                {selectedDateHeading}
              </h2>
              <span className="rounded-full bg-[#E8F0FF] px-2.5 py-1 text-xs font-semibold text-[#1455D9]">
                {todaysInterviews.length} {todaysInterviews.length === 1 ? "Interview" : "Interviews"}
              </span>
            </div>

            <div
              onScroll={handleTodayListScroll}
              className={`min-h-0 flex-1 space-y-3 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                !isSelectedDateToday || isTodayListExpanded
                  ? "max-h-[390px] overflow-y-auto"
                  : "overflow-hidden"
              }`}
            >
              {isLoadingTodaysInterviews && todaysInterviews.length === 0 ? (
                <div className="flex min-h-[250px] items-center justify-center text-sm font-medium text-blue-600">
                  Loading interviews...
                </div>
              ) : todaysInterviews.length === 0 ? (
                <NoDataView
                  message={
                    isSelectedDateToday
                      ? "No interviews scheduled for today"
                      : "No interviews scheduled for this date"
                  }
                  className="min-h-[250px]"
                />
              ) : (
                visibleTodaysInterviews.map((item) => (
                  <article
                    key={item.id}
                    className="relative rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.02)] transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <Button
                      type="button"
                      onClick={() => openEditScheduleModal(item)}
                      aria-label={`Edit ${item.candidate} interview`}
                      color="transparent"
                      size="xs"
                      defineWidth
                      className="absolute right-2 top-2 rounded p-1 text-slate-300 transition hover:bg-slate-50 hover:text-slate-600"
                      style={{ height: 28, width: 28, padding: 4, color: "#CBD5E1" }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => openEditScheduleModal(item)}
                      color="transparent"
                      variant="outline"
                      className="block pr-7 text-left"
                      style={{ height: "auto", padding: 0, justifyContent: "flex-start", border: "none", backgroundColor: "transparent", color: "inherit" }}
                    >
                      <div className="text-left">
                        <p className="align-middle text-sm font-semibold leading-[20px] tracking-[0px] text-[#075DE7]">
                          {formatTimeLabel(item.startTime)} - {formatTimeLabel(item.endTime)}
                        </p>
                        <h3 className="mt-2 align-middle text-base font-normal leading-[24px] tracking-[0px] text-slate-700">
                          {item.candidate}
                        </h3>
                        <p className="mt-0.5 align-middle text-base font-normal leading-[24px] tracking-[0px] text-slate-500">
                          {item.position}
                        </p>
                      </div>
                    </Button>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <TooltipText
                        text={`Interviewer: ${item.interviewer}`}
                        maxWidth="100%"
                        tooltipThreshold={28}
                        isApplyBgTextColor
                        tooltipClassName="text-slate-500"
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            {isSelectedDateToday &&
              !isTodayListExpanded &&
              todaysInterviews.length > TODAY_PREVIEW_COUNT && (
              <Button
                type="button"
                onClick={handleViewMoreToday}
                color="blue"
                fullWidth
                className="mt-4 h-11 w-full rounded-lg bg-[#1F5BEA] text-sm font-semibold text-white transition hover:bg-[#174ED1]"
              >
                View More
              </Button>
              )}
          </aside>
        </div>

        <section id="interview-pipeline" className="mt-4 scroll-mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-[18px] font-semibold leading-[28px] tracking-[0px] text-slate-800">
            Interview Pipeline - Tomorrow Onwards
          </h2>

          <div className="hidden max-h-[360px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:block">
            <SimpleDataTable
              data={pipelineInterviews}
              columns={pipelineColumns}
              getRowKey={(item) => item.id}
              onRowClick={openEditScheduleModal}
              emptyMessage={
                <NoDataView
                  message="No interviews scheduled from tomorrow onwards"
                  className="py-6"
                />
              }
              tableClassName="min-w-[820px]"
              headerRowClassName="bg-[#EEF3FF] align-middle text-[14px] font-semibold not-italic leading-5 tracking-[0px] text-slate-600"
            />
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:hidden">
            {pipelineInterviews.length === 0 ? (
              <NoDataView
                message="No interviews scheduled from tomorrow onwards"
                className="py-10"
              />
            ) : (
              pipelineInterviews.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  onClick={() => openEditScheduleModal(item)}
                  color="transparent"
                  variant="outline"
                  fullWidth
                  className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:!border-blue-200 hover:!bg-blue-50/20"
                  style={{ height: "auto", padding: 12, justifyContent: "stretch", border: "1px solid #E2E8F0", backgroundColor: "transparent", color: "inherit" }}
                >
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#DDEAFF] text-xs font-bold text-[#4770A5]">
                          {getInitials(item.candidate)}
                        </span>
                        <div className="min-w-0">
                          <TooltipText
                            text={item.candidate}
                            maxWidth="100%"
                            tooltipThreshold={22}
                            isApplyBgTextColor
                            tooltipClassName="text-sm font-semibold text-slate-700"
                          />
                          <TooltipText
                            text={item.position}
                            maxWidth="100%"
                            tooltipThreshold={24}
                            isApplyBgTextColor
                            tooltipClassName="text-xs text-slate-500"
                          />
                        </div>
                      </div>
                      <span className="rounded-full bg-[#EEF3FC] px-2.5 py-1 text-xs font-medium text-[#55708C]">{item.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      <span className="flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5" /> {item.interviewer}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" /> {formatPipelineDate(item.date, item.startTime)}
                      </span>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </section>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onCancel={() => setIsScheduleModalOpen(false)}
        title={editingInterviewId ? "Update Interview" : "Schedule Interview"}
        onSubmit={handleSaveInterview}
        saveText={editingInterviewId ? "Update" : "Schedule"}
        cancelText="Cancel"
        loading={isSavingInterview}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="Candidate" required disabled value={formData.candidate} placeholder="Candidate name" error={errors.candidate} />

          <Input label="Position" required disabled value={formData.position} placeholder="Job position" error={errors.position} />

          <div className="sm:col-span-2">
            <MultiSelectPagination
              label="Interviewers"
              title="Select Interviewers"
              required
              dataFetchCallBack={fetchEmployeeMasterDropdown}
              selectedValues={interviewerDropdown.selectedValues}
              options={interviewerDropdown.initialOptions}
              onChange={(values) => {
                const { idsString } = interviewerDropdown.handleChange(values);
                updateFormField("interviewerId", idsString);
                if (errors.interviewer) {
                  setErrors((previous) => ({
                    ...previous,
                    interviewer: undefined,
                  }));
                }
              }}
              error={errors.interviewer}
            />
          </div>

          <DatePickerInput
            label="Interview Date"
            required
            value={formatDate_dd_mm_yyyy(formData.date)}
            onChange={(value) => updateFormField("date", convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) || "")}
            error={errors.date}
          />

          <Input
            label="Stage"
            required
            value={formData.stage}
            onChange={(event) => updateFormField("stage", event.target.value)}
            placeholder="Enter interview stage"
            error={errors.stage}
          />

          <TimePicker
            label="Interview Time"
            required
            format={24}
            value={formData.startTime}
            onChange={(value) => updateFormField("startTime", value)}
            error={errors.startTime}
          />

          <div className="sm:col-span-2">
            <Input
              label="Attachment URL"
              value={formData.attachmentUrl}
              onChange={(event) => updateFormField("attachmentUrl", event.target.value)}
              placeholder="Enter attachment URL"
            />
          </div>

          <div className="sm:col-span-2">
            <TextArea
              label="Remarks"
              rows={3}
              autoResize={false}
              value={formData.remarks}
              onChange={(event) => updateFormField("remarks", event.target.value)}
              placeholder="Enter interview remarks"
            />
          </div>

          <div className="rounded-lg bg-[#F7F9FC] p-3 text-xs text-slate-500 sm:col-span-2">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />
                {formData.position || "Position not selected"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                {formatDate_dd_mm_yyyy(formData.date) || "Date not selected"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                {formData.startTime || "--:--"}
              </span>
              <span className="flex items-center gap-1.5">Stage: {formData.stage || "Not selected"}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewSchedule;
