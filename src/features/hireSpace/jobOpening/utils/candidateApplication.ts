import type {
  CandidateData,
  CandidateRemarkData,
  CandidateStatus,
  Stage,
} from "@/features/hireSpace/jobOpening/models/CandidateModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

export const DEFAULT_REMARK_UNIQUE_KEY = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

export const CANDIDATE_STAGES: Stage[] = [
  { id: "all", name: "All Applications" },
  { id: "new", name: "New", status: "NEW" },
  { id: "screening", name: "Screening", status: "SCREENING" },
  { id: "shortlisted", name: "Shortlisted", status: "SHORTLISTED" },
  { id: "interview", name: "Interview", status: "INTERVIEW" },
  { id: "selected", name: "Selected", status: "SELECTED" },
  { id: "rejected", name: "Rejected", status: "REJECTED" },
];

export const STAGE_ID_TO_STATUS: Record<string, CandidateStatus | undefined> = {
  all: undefined,
  new: "NEW",
  screening: "SCREENING",
  shortlisted: "SHORTLISTED",
  interview: "INTERVIEW",
  selected: "SELECTED",
  rejected: "REJECTED",
};

export const STATUS_TO_STAGE_ID: Record<CandidateStatus, string> = {
  NEW: "new",
  SCREENING: "screening",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  SELECTED: "selected",
  REJECTED: "rejected",
};

export const STATUS_TO_API_VALUE: Record<CandidateStatus, string> = {
  NEW: "New",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

export const STAGE_OPTIONS = Object.entries(STATUS_TO_API_VALUE).map(([value, label]) => ({
  value: value as CandidateStatus,
  label,
}));

export const normalizeCandidateStatus = (value?: string | null): CandidateStatus => {
  const status = String(value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  switch (status) {
    case "SCREENING":
      return "SCREENING";
    case "SHORTLISTED":
    case "SHORTLIST":
      return "SHORTLISTED";
    case "INTERVIEW":
    case "INTERVIEWED":
      return "INTERVIEW";
    case "SELECTED":
      return "SELECTED";
    case "REJECTED":
      return "REJECTED";
    default:
      return "NEW";
  }
};

export const getCurrentUserId = (): number =>
  Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId) || 0;

export const getCurrentUserName = (): string =>
  LocalStorageHelper.getStoredEmployeeData()?.FullName?.trim() || "";

export const formatCandidateDate = (value?: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getCandidateName = (item: CandidateData): string =>
  item.FullName?.trim() || "Unknown Candidate";

export const getCandidateRole = (item: CandidateData): string =>
  item.CurrentRole?.trim() || "Not Available";

export const getCandidateCompany = (item: CandidateData): string =>
  item.CurrentCompany?.trim() || "Not Available";

export const getCandidateStatus = (item: CandidateData): CandidateStatus =>
  normalizeCandidateStatus(item.ApplicationStatus);

export const getCandidatePhoto = (item: CandidateData): string =>
  item.Photograph?.trim() || "";

export const getCandidateResumeUrl = (item: CandidateData): string =>
  item.ResumeUrl?.trim() || "";

export const getCandidateEmail = (item: CandidateData): string =>
  item.Email?.trim() || "-";

export const getCandidateLocation = (item: CandidateData): string =>
  item.WorkLocation?.trim() || "-";

export const getCandidateExperienceLabel = (item: CandidateData): string => {
  const years = Number(item.YearsOfExperience) || 0;
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);

  if (wholeYears > 0 && months > 0) return `${wholeYears} Years ${months} Months`;
  if (wholeYears > 0) return `${wholeYears} Years Exp.`;
  if (months > 0) return `${months} Months Exp.`;
  return "0 Years Exp.";
};

export const getCandidateSkills = (item: CandidateData): string[] =>
  (item.Skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

export const getCandidateStatusClass = (status: CandidateStatus): string => {
  switch (status) {
    case "SCREENING":
      return "bg-blue-100 text-blue-700";
    case "SHORTLISTED":
      return "bg-indigo-100 text-indigo-700";
    case "INTERVIEW":
      return "bg-amber-100 text-amber-700";
    case "SELECTED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const getRemarkAuthor = (remark: CandidateRemarkData): string => {
  const name = remark.CreatedByName?.trim() || remark.EmployeeName?.trim() || remark.AuthorName?.trim();
  const designation = remark.CreatedByDesignation?.trim() || remark.DesignationName?.trim();

  if (name && designation) return `${name} - ${designation}`;
  if (name) return name;
  return remark.CreatedById > 0 ? `User #${remark.CreatedById}` : "System";
};
