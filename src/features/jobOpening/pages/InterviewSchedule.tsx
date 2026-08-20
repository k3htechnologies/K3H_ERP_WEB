import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as E from "fp-ts/Either";
import { BriefcaseBusiness, CalendarDays, Clock3, UserRound } from "lucide-react";
import {
  convert_dd_mm_yyyy_To_Yyyy_mm_dd,
  formatDate_dd_mm_yyyy,
  formatDate_dd_MonthName_yy,
  formatDate_yyyy_mm_dd,
  isToday,
} from "@/core/utils/dateFormat";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import CustomCalendar from "@/ui/components/Calender/CustomCalendar";
import type { CalendarEvent } from "@/ui/components/Calender/CalendarEvent";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { Button, Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { Modal } from "@/ui/components/Modal/Modal";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { useToast } from "@/core/hooks/useToast";
import { InterviewCalendarHeader, InterviewDetailsCard } from "@/features/jobOpening/components";
import type { InterviewCalendarView } from "@/features/jobOpening/components/InterviewCalendarHeader";
import { CandidateInterviewService } from "@/features/jobOpening/services/CandidateInterviewService";
import type {
  CandidateInterviewData,
  InterviewRouteCandidate,
  InterviewScheduleFormErrors,
  InterviewScheduleFormState,
} from "@/features/jobOpening/models/CandidateInterviewModel";
import { DEFAULT_REMARK_UNIQUE_KEY } from "@/features/jobOpening/utils/candidateApplication";
import {
  buildInterviewCalendarEvents,
  combineInterviewDateAndTime,
  getInitialInterviewFormState,
  getInterviewCandidateName,
  getInterviewDate,
  getInterviewDateTimeLabel,
  getInterviewRoleName,
  getInterviewStatusBadgeClass,
  getInterviewTime,
  hasInterviewBinding,
  isSameCalendarDate,
  isScheduledInterview,
  toAttachmentUrlList,
  toCalendarNavigationDate,
  toInterviewDateTimeIso,
} from "@/features/jobOpening/utils/interviewSchedule";

const TODAY_PREVIEW_COUNT = 2;

export const InterviewSchedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/jobOpenings");

  const passedCandidate = (location.state?.candidate || null) as InterviewRouteCandidate | null;
  const candidateId = Number(searchParams.get("candidateId") || passedCandidate?.candidateId || passedCandidate?.id || 0);
  const jobOpeningMasterId = Number(searchParams.get("jobOpeningMasterId") || passedCandidate?.jobOpeningMasterId || 0);

  const [calendarView, setCalendarView] = useState<InterviewCalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => toCalendarNavigationDate(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toCalendarNavigationDate(new Date()));
  const [interviews, setInterviews] = useState<CandidateInterviewData[]>([]);
  const [isTodayListExpanded, setIsTodayListExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [errors, setErrors] = useState<InterviewScheduleFormErrors>({});
  const [formData, setFormData] = useState<InterviewScheduleFormState>(() =>
    getInitialInterviewFormState(passedCandidate, toCalendarNavigationDate(new Date())),
  );
  const [attachmentFiles, setAttachmentFiles] = useState<(File | string)[]>([]);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null);
  const [removedAttachmentUrls, setRemovedAttachmentUrls] = useState<string[]>([]);

  const interviewerDropdown = useMultiSelectDropdown({
    value: formData.interviewerId,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  })

  const monthKey = useMemo(
    () => `${currentDate.getFullYear()}-${currentDate.getMonth()}`,
    [currentDate],
  );

  const loadInterviews = useCallback(async (month: number, year: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await CandidateInterviewService.apiCallPullCandidateInterview({
          PageSize: 1000,
          PageNumber: 1,
          Month: month,
          Year: year,
        });

        if (E.isRight(response)) {
          setInterviews(response.right.Data ?? []);
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Interviews",
    );
  }, [addToast]);

  useEffect(() => {
    void loadInterviews(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [monthKey, loadInterviews]);

  useEffect(() => {
    setIsTodayListExpanded(false);
  }, [selectedDate]);
 
  const calendarEvents = useMemo(
    () => buildInterviewCalendarEvents(interviews, passedCandidate, candidateId),
    [candidateId, interviews, passedCandidate],
  );
 
  const selectedDateInterviews = useMemo(
    () =>
      interviews
        .filter((item) => hasInterviewBinding(item) && isScheduledInterview(item) && isSameCalendarDate(getInterviewDate(item), selectedDate))
        .sort((first, second) => getInterviewTime(first).localeCompare(getInterviewTime(second))),
    [interviews, selectedDate],
  );

  const pipelineInterviews = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return interviews
      .filter((item) => {
        const interviewDate = getInterviewDate(item);
        if (!hasInterviewBinding(item) || !interviewDate || !isScheduledInterview(item)) return false;
        return combineInterviewDateAndTime(interviewDate, getInterviewTime(item)).getTime() >= today.getTime();
      })
      .sort((first, second) => {
        const firstDate = getInterviewDate(first);
        const secondDate = getInterviewDate(second);
        if (!firstDate || !secondDate) return 0;
        return (
          combineInterviewDateAndTime(firstDate, getInterviewTime(first)).getTime() -
          combineInterviewDateAndTime(secondDate, getInterviewTime(second)).getTime()
        );
      });
  }, [interviews]);

  const pipelineColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "CandidateName",
        label: "Candidate",
        render: (_value, item: CandidateInterviewData) => {
          const candidateName = getInterviewCandidateName(item, passedCandidate, candidateId);

          return (
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center overflow-hidden rounded-full bg-[#DDEAFF] text-xs font-bold text-[#4770A5]">
                {item.Photograph ? (
                  <img src={item.Photograph} alt={candidateName} className="h-full w-full object-cover" />
                ) : (
                  getNameInitials(candidateName)
                )}
              </span>
              <span className="align-middle text-xs font-normal text-slate-700">{candidateName}</span>
            </div>
          );
        },
      },
      {
        key: "RoleName",
        label: "Position",
        render: (_value, item: CandidateInterviewData) => getInterviewRoleName(item, passedCandidate, candidateId),
      },
      {
        key: "InterviewPanelName",
        label: "Interviewer",
        render: (_value, item: CandidateInterviewData) => item.InterviewPanelName?.trim() || "-",
      },
      {
        key: "InterviewDate",
        label: "Date & Time",
        render: (_value, item: CandidateInterviewData) => getInterviewDateTimeLabel(item),
      },
      {
        key: "InterviewStatus",
        label: "Status",
        align: "center",
        render: (_value, item: CandidateInterviewData) => {
          const status = item.InterviewStatus?.trim() || "Scheduled";
          return (
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getInterviewStatusBadgeClass(status)}`}>
              {status}
            </span>
          );
        },
      },
    ],
    [candidateId, passedCandidate],
  );

  const isSelectedDateToday = isToday(selectedDate);
  const selectedDateHeading = isSelectedDateToday
    ? "Upcoming Today"
    : `Interviews - ${formatDate_dd_MonthName_yy(selectedDate)}`;

  const visibleTodaysInterviews = useMemo(
    () => (!isSelectedDateToday || isTodayListExpanded ? selectedDateInterviews : selectedDateInterviews.slice(0, TODAY_PREVIEW_COUNT)),
    [isSelectedDateToday, isTodayListExpanded, selectedDateInterviews],
  );
  
  const handleDateChange = useCallback((date: Date) => {
    const navigationDate = toCalendarNavigationDate(date);
    setSelectedDate(navigationDate);
    setCurrentDate(navigationDate);
  }, []);

  const handlePreviousPeriod = useCallback(() => {
    const next = new Date(currentDate);
    if (calendarView === "day") next.setDate(next.getDate() - 1);
    else if (calendarView === "week") next.setDate(next.getDate() - 7);
    else next.setFullYear(next.getFullYear(), next.getMonth() - 1, 1);
    setCurrentDate(next);
    setSelectedDate(next);
  }, [calendarView, currentDate]);

  const handleNextPeriod = useCallback(() => {
    const next = new Date(currentDate);
    if (calendarView === "day") next.setDate(next.getDate() + 1);
    else if (calendarView === "week") next.setDate(next.getDate() + 7);
    else next.setFullYear(next.getFullYear(), next.getMonth() + 1, 1);
    setCurrentDate(next);
    setSelectedDate(next);
  }, [calendarView, currentDate]);

  const handleViewMoreToday = useCallback(() => {
    setIsTodayListExpanded(true);
  }, []);

  const handleCloseScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setAttachmentFiles([]);
    setExistingAttachmentUrl(null);
    setRemovedAttachmentUrls([]);
  }, []);

  const openNewScheduleModal = useCallback(() => {
    setEditingInterviewId(null);
    setErrors({});
    setAttachmentFiles([]);
    setExistingAttachmentUrl(null);
    setRemovedAttachmentUrls([]);
    setFormData(getInitialInterviewFormState(passedCandidate, selectedDate));
    setIsScheduleModalOpen(true);
  }, [passedCandidate, selectedDate]);

  const openEditScheduleModal = useCallback((item: CandidateInterviewData) => {
    const interviewDate = getInterviewDate(item);
    const candidateName = getInterviewCandidateName(item, passedCandidate, candidateId);
    const roleName = getInterviewRoleName(item, passedCandidate, candidateId);
    const existingUrls = toAttachmentUrlList(item.AttachmentUrl);

    setEditingInterviewId(item.InterviewId || null);
    setErrors({});
    setAttachmentFiles([]);
    setExistingAttachmentUrl(existingUrls.join(",") || null);
    setRemovedAttachmentUrls([]);
    setFormData({
      candidate: candidateName === "-" ? "" : candidateName,
      position: roleName === "-" ? "" : roleName,
      interviewerId: item.InterviewPanel || "",
      date: formatDate_yyyy_mm_dd(interviewDate ?? selectedDate),
      startTime: getInterviewTime(item),
      stage: item.Stage || "Interview",
      remarks: item.Remarks || "",
    });
    setIsScheduleModalOpen(true);
  }, [candidateId, passedCandidate, selectedDate]);

  const handleEventClick = useCallback(
    (calendarEvent: CalendarEvent) => {
      const item = interviews.find((interview) => interview.InterviewId === Number(calendarEvent.id));
      if (!item) return;

      const interviewDate = getInterviewDate(item);
      if (interviewDate) handleDateChange(interviewDate);
      openEditScheduleModal(item);
    },
    [handleDateChange, interviews, openEditScheduleModal],
  );

  const handleBackInterviewPage = useCallback(() => {
    navigate(-1);
  }, [navigate]);


  const updateFormField = useCallback(<K extends keyof InterviewScheduleFormState>(field: K, value: InterviewScheduleFormState[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }, []);


  const validateScheduleInterviewForm = useCallback((): {
    isValid: boolean;
    errors: InterviewScheduleFormErrors;
  } => {
    const nextErrors: InterviewScheduleFormErrors = {};
    const editingInterview = interviews.find((item) => item.InterviewId === editingInterviewId);
    const effectiveCandidateId = editingInterview?.CandidateId || candidateId;
    const effectiveJobOpeningMasterId = editingInterview?.JobOpeningMasterId || jobOpeningMasterId;

    if (!effectiveCandidateId || !formData.candidate.trim()) {
      nextErrors.candidate = "A valid candidate is required";
    }
    if (!effectiveJobOpeningMasterId || !formData.position.trim()) {
      nextErrors.position = "A valid job opening is required";
    }
    if (!formData.interviewerId) {
      nextErrors.interviewer = "Select at least one interviewer";
    }
    if (!formData.date) nextErrors.date = "Interview date is required";
    if (!formData.startTime) nextErrors.startTime = "Interview time is required";
    if (!formData.stage.trim()) nextErrors.stage = "Stage is required";

    return {
      isValid: Object.keys(nextErrors).length === 0,
      errors: nextErrors,
    };
  }, [candidateId, editingInterviewId, formData, interviews, jobOpeningMasterId]);


  const pushCandidateInterviewFormData = useCallback((): FormData => {
    const editingInterview = interviews.find((item) => item.InterviewId === editingInterviewId);
    const fd = new FormData();

    fd.append("InterviewId", String(editingInterviewId || 0));
    fd.append("UniqueKey", editingInterview?.UniqueKey || DEFAULT_REMARK_UNIQUE_KEY);
    fd.append("CandidateId", String(editingInterview?.CandidateId || candidateId));
    fd.append("JobOpeningMasterId", String(editingInterview?.JobOpeningMasterId || jobOpeningMasterId));
    fd.append("Stage", formData.stage.trim());
    fd.append("InterviewPanel", formData.interviewerId);
    fd.append("InterviewDate", toInterviewDateTimeIso(formData.date, formData.startTime));
    fd.append("InterviewTime", formData.startTime);
    fd.append("Remarks", formData.remarks.trim());

    attachmentFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("AttachmentUrl", file);
      }
    });
    fd.append("RemoveattachmentUrl", removedAttachmentUrls.join(","));

    return fd;
  }, [attachmentFiles, candidateId, editingInterviewId, formData, interviews, jobOpeningMasterId, removedAttachmentUrls]);


  const handleAddUpdateInterview = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validation = validateScheduleInterviewForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      addToast({ type: "error", title: "Please fill the required field" });
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const request = pushCandidateInterviewFormData();
        const interviewDate = new Date(`${formData.date}T${formData.startTime}:00`);
        const response = await CandidateInterviewService.apiCallAddUpdateCandidateInterview(request);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });
          const navigationDate = toCalendarNavigationDate(interviewDate);
          setSelectedDate(navigationDate);
          setCurrentDate(navigationDate);
          handleCloseScheduleModal();
          await loadInterviews(
            navigationDate.getMonth() + 1,
            navigationDate.getFullYear(),
          );
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      editingInterviewId ? "Update" : "Schedule",
    );
  }, [
    addToast,
    editingInterviewId,
    formData.date,
    formData.startTime,
    handleCloseScheduleModal,
    loadInterviews,
    pushCandidateInterviewFormData,
    validateScheduleInterviewForm,
  ]);


  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <div className="mb-5">
        <HeaderActionBar
          titleText="Schedule Interview"
          onCancel={handleBackInterviewPage}
          canAction={canAction}
          EditText="Schedule Interview"
          onEdit={openNewScheduleModal}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,1fr)]">
        <section className="flex h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <InterviewCalendarHeader
            currentDate={currentDate}
            calendarView={calendarView}
            onPreviousPeriod={handlePreviousPeriod}
            onNextPeriod={handleNextPeriod}
            onViewChange={setCalendarView}
          />

          <div className="min-h-0 flex-1 overflow-y-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CustomCalendar
              view={calendarView}
              currentDate={currentDate}
              events={calendarEvents}
              onDateChange={handleDateChange}
              onEventClick={handleEventClick}
            />
          </div>
        </section>

        <aside className="flex h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="align-middle text-lg font-semibold leading-7 tracking-normal text-slate-800">{selectedDateHeading}</h2>
            <span className="rounded-full bg-[#E8F0FF] px-2.5 py-1 text-xs font-semibold text-[#1455D9]">
              {selectedDateInterviews.length} {selectedDateInterviews.length === 1 ? "Interview" : "Interviews"}
            </span>
          </div>

          <div
            className={`min-h-0 flex-1 space-y-3 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              !isSelectedDateToday || isTodayListExpanded ? "max-h-[390px] overflow-y-auto" : "overflow-hidden"
            }`}
          >
            {selectedDateInterviews.length === 0 ? (
              <NoDataView message={isSelectedDateToday ? "No upcoming interviews for today" : "No interviews scheduled for this date"} />
            ) : (
              visibleTodaysInterviews.map((item) => (
                <InterviewDetailsCard
                  key={item.InterviewId}
                  interview={item}
                  canAction={canAction}
                  routeCandidate={passedCandidate}
                  routeCandidateId={candidateId}
                  onEdit={openEditScheduleModal}
                />
              ))
            )}
          </div>

          {isSelectedDateToday && !isTodayListExpanded && selectedDateInterviews.length > TODAY_PREVIEW_COUNT && (
            <div className="mt-4">
              <Button onClick={handleViewMoreToday} color="blue" fullWidth>
                View More
              </Button>
            </div>
          )}
        </aside>
      </div>

      <section id="interview-pipeline" className="mt-4 scroll-mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-[18px] font-semibold leading-[28px] tracking-[0px] text-slate-800">Interview Pipeline</h2>

        <div className="hidden max-h-[360px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:block">
          <div className="min-w-[820px]">
            <DataTable
              data={pipelineInterviews}
              columns={pipelineColumns}
              onRowClick={canAction ? (row) => openEditScheduleModal(row as CandidateInterviewData) : undefined}
              emptyMessage="No upcoming interviews scheduled"
              variant="minimal"
            />
          </div>
        </div>

        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:hidden">
          {pipelineInterviews.length === 0 ? (
            <NoDataView message="No upcoming interviews scheduled" />
          ) : (
            pipelineInterviews.map((item) => {
              const candidateName = getInterviewCandidateName(item, passedCandidate, candidateId);

              return (
                <Button
                  key={item.InterviewId}
                  type="button"
                  onClick={() => {
                    if (canAction) openEditScheduleModal(item);
                  }}
                  disabled={!canAction}
                  color="transparent"
                  fullWidth
                  className="rounded-lg text-left"
                  style={{
                    height: "auto",
                    padding: "12px",
                    border: "1px solid #E2E8F0",
                    justifyContent: "flex-start",
                  }}
                >
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full bg-[#DDEAFF] text-xs font-bold text-[#4770A5]">
                          {item.Photograph ? (
                            <img src={item.Photograph} alt={candidateName} className="h-full w-full object-cover" />
                          ) : (
                            getNameInitials(candidateName)
                          )}
                        </span>
                        <FieldItem label="Candidate" value={candidateName} />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getInterviewStatusBadgeClass(item.InterviewStatus)}`}>
                        {item.InterviewStatus?.trim() || "Scheduled"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FieldItem label="Position" value={getInterviewRoleName(item, passedCandidate, candidateId)} />
                      <FieldItem
                        label="Interviewer"
                        value={
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <UserRound className="h-3.5 w-3.5" /> {item.InterviewPanelName?.trim() || "-"}
                          </span>
                        }
                      />
                      <FieldItem
                        label="Date & Time"
                        value={
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" /> {getInterviewDateTimeLabel(item)}
                          </span>
                        }
                      />
                    </div>
                  </div>
                </Button>
              );
            })
          )}
        </div>
      </section>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseScheduleModal}
        onCancel={handleCloseScheduleModal}
        title={editingInterviewId ? "Update Interview" : "Schedule Interview"}
        onSubmit={handleAddUpdateInterview}
        saveText={editingInterviewId ? "Update" : "Schedule"}
        cancelText="Cancel"
        loading={isLoading}
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
            <MultiFilePicker
              label="Attachment"
              value={attachmentFiles}
              onChange={setAttachmentFiles}
              availableFilesURL={existingAttachmentUrl ?? ""}
              onRemoveExisting={(url) => {
                setRemovedAttachmentUrls((previous) => [...previous, url]);
              }}
              maxFiles={5}
            />
          </div>

          <div className="sm:col-span-2">
            <TextArea
              label="Remarks"
              autoResize={false}
              value={formData.remarks}
              onChange={(event) => updateFormField("remarks", event.target.value)}
              placeholder="Enter interview remarks"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#F7F9FC] p-3 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
            <FieldItem
              label="Position"
              value={
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />
                  {formData.position}
                </span>
              }
            />
            <FieldItem
              label="Interview Date"
              value={
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate_dd_mm_yyyy(formData.date)}
                </span>
              }
            />
            <FieldItem
              label="Interview Time"
              value={
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                  {formData.startTime}
                </span>
              }
            />
            <FieldItem label="Stage" value={formData.stage} />
          </div>
        </div>
      </Modal>
    </div>
  );
  //#endregion
};

export default InterviewSchedule;
