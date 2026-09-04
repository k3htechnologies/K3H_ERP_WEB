import { parseDocumentUrls } from "@/core/utils/documentUtils";
import {
  convert_hh_mm_ss_to_hh_mm,
  formatDate_dd_MonthName_yy_hh_mm,
  formatDate_yyyy_mm_dd,
} from "@/core/utils/dateFormat";
import type { CalendarEvent } from "@/ui/components/Calender/CalendarEvent";
import type {
  CandidateInterviewData,
  InterviewRouteCandidate,
  InterviewScheduleFormState,
} from "@/features/hireSpace/jobOpening/models/CandidateInterviewModel";

export const getCandidatePosition = (candidate: InterviewRouteCandidate | null): string =>
  candidate?.appliedRole?.trim() || candidate?.role?.trim() || "";

export const toCalendarNavigationDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);

export const getInterviewDate = (item: CandidateInterviewData): Date | null => {
  const dateValue = String(item.InterviewDate || item.CalendarDate || "").trim();
  if (!dateValue) return null;

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const getInterviewTime = (item: CandidateInterviewData): string => {
  const match = /^(\d{1,2}):(\d{2})/.exec(item.InterviewTime || "");
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
};

export const getInterviewDateTimeLabel = (item: CandidateInterviewData): string => {
  const interviewDate = getInterviewDate(item);
  if (!interviewDate) return "-";
  return formatDate_dd_MonthName_yy_hh_mm(formatDate_yyyy_mm_dd(interviewDate), getInterviewTime(item)) || "-";
};

export const hasInterviewBinding = (item: CandidateInterviewData): boolean =>
  Number(item.InterviewId) > 0 && getInterviewDate(item) !== null;

export const combineInterviewDateAndTime = (date: Date, time: string): Date => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const isSameCalendarDate = (first: Date | null, second: Date): boolean =>
  Boolean(
    first &&
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate(),
  );

export const addHourToTime = (value: string): string => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return `${String((hours + 1) % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const toInterviewDateTimeIso = (date: string, time: string): string => `${date}T${time}:00`;

export const toAttachmentUrlList = (value?: string | string[] | null): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return parseDocumentUrls(value);
};

export const getInitialInterviewFormState = (
  candidate: InterviewRouteCandidate | null,
  selectedDate: Date,
): InterviewScheduleFormState => ({
  candidate: candidate?.name || "",
  position: getCandidatePosition(candidate),
  interviewerId: "",
  date: formatDate_yyyy_mm_dd(selectedDate),
  startTime: "10:00",
  stage: "Interview",
  remarks: "",
});

export const getInterviewCandidateName = (
  item: CandidateInterviewData,
  routeCandidate?: InterviewRouteCandidate | null,
  routeCandidateId?: number,
): string =>
  item.CandidateName?.trim()
  || (Number(item.CandidateId) === routeCandidateId ? routeCandidate?.name?.trim() : "")
  || "-";

export const getInterviewRoleName = (
  item: CandidateInterviewData,
  routeCandidate?: InterviewRouteCandidate | null,
  routeCandidateId?: number,
): string =>
  item.RoleName?.trim()
  || (Number(item.CandidateId) === routeCandidateId ? getCandidatePosition(routeCandidate ?? null) : "")
  || "-";

export const isScheduledInterview = (item: CandidateInterviewData): boolean =>
  String(item.InterviewStatus || "Scheduled").toLowerCase() === "scheduled";

export const getInterviewStatusBadgeClass = (status?: string | null): string => {
  const normalized = (status || "Scheduled").toLowerCase();

  if (normalized === "completed") return "bg-emerald-50 text-emerald-700";
  if (normalized === "cancelled" || normalized === "canceled") return "bg-red-50 text-red-600";
  return "bg-[#EEF3FC] text-[#55708C]";
};

export const buildInterviewCalendarEvents = (
  interviews: CandidateInterviewData[],
  routeCandidate?: InterviewRouteCandidate | null,
  routeCandidateId?: number,
): CalendarEvent[] =>
  interviews
    .map((item, index) => {
      if (!hasInterviewBinding(item)) return null;

      const interviewDate = getInterviewDate(item);
      if (!interviewDate) return null;

      const startTime = getInterviewTime(item);
      const dateKey = formatDate_yyyy_mm_dd(interviewDate);
      const candidateName = getInterviewCandidateName(item, routeCandidate, routeCandidateId);
      const timeLabel = startTime ? convert_hh_mm_ss_to_hh_mm(startTime) : "";
      const title = [timeLabel, candidateName !== "-" ? candidateName : ""].filter(Boolean).join(" - ");
      if (!title) return null;
      const colors: CalendarEvent["color"][] = ["blue", "orange", "green"];

      return {
        id: item.InterviewId || index + 1,
        type: "MEETING",
        title,
        color: colors[index % colors.length],
        start: `${dateKey}T${startTime || "00:00"}:00`,
        end: `${dateKey}T${startTime ? addHourToTime(startTime) : "01:00"}:00`,
        description: item.Remarks || "",
        fullname: item.InterviewPanelName || "",
        CreatedBy: item.InterviewPanelName || "",
        CreatedDate: dateKey,
      };
    })
    .filter(Boolean) as CalendarEvent[];
