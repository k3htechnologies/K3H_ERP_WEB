import type {
  Candidate,
  CandidateData,
  CandidateRemark,
  CandidateRemarkData,
  CandidateStatus,
  CandidateApplicationTimelineData,
  CandidateInterviewData,
  Stage,
  TimelineEvent,
} from "../models/JobOpeningModel";

export type ApiRecord =
  | CandidateData
  | CandidateRemarkData
  | CandidateApplicationTimelineData
  | CandidateInterviewData;

export const DEFAULT_REMARK_UNIQUE_KEY =
  "3fa85f64-5717-4562-b3fc-2c963f66afa6";

export const CANDIDATE_STAGES: Stage[] = [
  { id: "all", name: "All Applications" },
  { id: "new", name: "New", status: "NEW" },
  { id: "screening", name: "Screening", status: "SCREENING" },
  { id: "shortlisted", name: "Shortlisted", status: "SHORTLISTED" },
  { id: "interview", name: "Interview", status: "INTERVIEW" },
  { id: "selected", name: "Selected", status: "SELECTED" },
  { id: "rejected", name: "Rejected", status: "REJECTED" },
];

export const STAGE_ID_TO_STATUS: Record<
  string,
  CandidateStatus | undefined
> = {
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

export const STAGE_OPTIONS = Object.entries(STATUS_TO_API_VALUE).map(
  ([value, label]) => ({
    value: value as CandidateStatus,
    label,
  }),
);

export const firstDefined = (data: ApiRecord, keys: string[]): unknown => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

export const stringValue = (
  data: ApiRecord,
  keys: string[],
  fallback = "",
): string => {
  const value = firstDefined(data, keys);
  return value === undefined ? fallback : String(value);
};

export const numberValue = (
  data: ApiRecord,
  keys: string[],
  fallback = 0,
): number => {
  const value = Number(firstDefined(data, keys));
  return Number.isFinite(value) ? value : fallback;
};

export const normalizeCandidateStatus = (
  value?: string | null,
): CandidateStatus => {
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

export const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const getCurrentUserId = (): number => {
  for (const key of ["UserId", "userId", "EmployeeId", "employeeId"]) {
    const value = Number(localStorage.getItem(key));
    if (Number.isFinite(value) && value > 0) return value;
  }

  try {
    const employee = JSON.parse(localStorage.getItem("employee_data") || "null") as {
      EmployeeId?: unknown;
    } | null;
    const employeeId = Number(employee?.EmployeeId);
    if (Number.isFinite(employeeId) && employeeId > 0) return employeeId;
  } catch {
    return 0;
  }

  return 0;
};

export const getCurrentUserName = (): string => {
  try {
    const employee = JSON.parse(localStorage.getItem("employee_data") || "null") as {
      FullName?: unknown;
    } | null;
    return typeof employee?.FullName === "string"
      ? employee.FullName.trim()
      : "";
  } catch {
    return "";
  }
};

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

const parseSkills = (apiData: ApiRecord): string[] => {
  const skills = apiData.Skills;
  if (Array.isArray(skills)) return skills.map(String);

  const value = firstDefined(apiData, [
    "JobSkills",
    "Skills",
    "SkillNames",
  ]);
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const mapApiToCandidate = (apiData: ApiRecord): Candidate => {
  const candidateId = numberValue(apiData, ["CandidateId", "CareerId"]);
  const uniqueKey = stringValue(apiData, [
    "UniqueKey",
    "CandidateUniqueKey",
  ]);
  const years = numberValue(apiData, [
    "YearsOfExperience",
    "ExperienceYears",
  ]);
  const months = numberValue(apiData, [
    "MonthsOfExperience",
    "ExperienceMonths",
  ]);
  const role = stringValue(
    apiData,
    ["CurrentRole", "JobRoleName", "RoleName"],
    "Not Available",
  );
  const appliedRole = stringValue(
    apiData,
    ["JobRoleName", "RoleName"],
    "Position",
  );
  const company = stringValue(
    apiData,
    ["CurrentCompany", "CompanyName"],
    "Not Available",
  );
  const name = stringValue(
    apiData,
    ["FullName", "CandidateName"],
    "Unknown Candidate",
  );
  const email = stringValue(apiData, ["Email", "EmailAddress"], "-");
  const createdDateValue = firstDefined(apiData, [
    "CreatedDate",
    "AppliedDate",
    "ApplicationDate",
  ]);
  const createdDate =
    createdDateValue === undefined ? undefined : String(createdDateValue);
  const expectedSalaryValue = firstDefined(apiData, ["ExpectedSalary"]);
  const expectedSalary = Number(expectedSalaryValue);
  const noticePeriodValue = firstDefined(apiData, ["NoticePeriod"]);

  return {
    id:
      candidateId > 0
        ? String(candidateId)
        : uniqueKey || [name, email, createdDate].filter(Boolean).join("-"),
    candidateId,
    jobOpeningMasterId: numberValue(apiData, [
      "JobOpeningMasterId",
      "JobOpeningId",
    ]),
    uniqueKey,
    name,
    role,
    appliedRole,
    status: normalizeCandidateStatus(
      stringValue(apiData, ["ApplicationStatus", "ApplicantStatus"]),
    ),
    experience: `${years} Years Exp.`,
    company,
    appliedDate: formatCandidateDate(createdDate),
    matchScore: numberValue(apiData, ["MatchScore", "ProfileMatchScore"]),
    ResumeUrl: stringValue(apiData, [
      "ResumeUrl",
      "ResumeURL",
      "ResumeFileUrl",
      "ResumeDocumentUrl",
      "ResumePath",
    ]),
    avatarUrl:
      stringValue(apiData, [
        "Photograph",
        "PhotographUrl",
        "PhotographURL",
        "ProfileImage",
        "ProfileImageUrl",
        "ProfileImageURL",
        "PhotoUrl",
        "PhotoURL",
      ]) || undefined,
    email,
    location: stringValue(apiData, ["Location", "CurrentLocation"], "-"),
    currentPosition: `${role} at ${company}`,
    experienceDetail:
      months > 0
        ? `${years} Years ${months} Months`
        : `${years} Years`,
    expectedSalary:
      expectedSalaryValue !== undefined && Number.isFinite(expectedSalary)
        ? "\u20B9" + expectedSalary.toLocaleString("en-IN")
        : "-",
    noticePeriod:
      noticePeriodValue !== undefined
        ? `${String(noticePeriodValue)} Days`
        : "-",
    skills: parseSkills(apiData),
    education: {
      degree: stringValue(
        apiData,
        ["HighestQualification", "Degree"],
        "-",
      ),
      school: stringValue(
        apiData,
        ["UniversityInstitution", "UniversityName", "InstituteName"],
        "-",
      ),
      duration: stringValue(
        apiData,
        ["GraduationYear", "EducationDuration"],
        "-",
      ),
    },
    remarks: [],
    timeline: [
      {
        event: `Applied for ${appliedRole}`,
        by: stringValue(
          apiData,
          ["CreatedByName", "AppliedByName"],
          "System",
        ),
        date: formatCandidateDate(createdDate),
        timestamp: createdDate ? new Date(createdDate).getTime() || undefined : undefined,
      },
    ],
  };
};

export const mapApiToRemark = (item: ApiRecord): CandidateRemark => ({
  CandidateRemarkId: numberValue(item, ["CandidateRemarkId"]),
  UniqueKey: stringValue(item, ["UniqueKey"]),
  CandidateId: numberValue(item, ["CandidateId"]),
  Remark: stringValue(item, ["Remark"]),
  ApplicantStatus: normalizeCandidateStatus(
    stringValue(item, ["ApplicantStatus"]),
  ),
  IsActive: item.IsActive !== false,
  IsDeleted:
    typeof item.IsDeleted === "boolean" ? item.IsDeleted : null,
  CreatedById: numberValue(item, ["CreatedById"]),
  CreatedByName:
    stringValue(item, [
      "CreatedByName",
      "EmployeeName",
      "AuthorName",
      "CreatedBy",
    ]) || undefined,
  CreatedByDesignation:
    stringValue(item, [
      "CreatedByDesignation",
      "DesignationName",
      "RoleName",
    ]) || undefined,
  CreatedDate: stringValue(item, ["CreatedDate"]),
  ModifiedById: numberValue(item, ["ModifiedById"]),
  ModifiedDate:
    stringValue(item, ["ModifiedDate"]) || null,
});

export const mapApiToTimelineEvent = (item: ApiRecord): TimelineEvent => {
  const activityDate = stringValue(item, [
    "ActivityDate",
    "ProcessDate",
    "StatusDate",
    "ActionDate",
    "UpdatedDate",
    "ModifiedDate",
    "CreatedDate",
  ]);

  const stage = stringValue(item, [
    "NewStatus",
    "NewApplicantStatus",
    "CurrentStatus",
    "ToStatus",
    "ToApplicantStatus",
    "CandidateStage",
    "ApplicationStage",
    "Stage",
    "StageName",
    "ApplicantStatus",
    "ApplicantStatusName",
    "ApplicationStatus",
    "ApplicationStatusName",
    "Status",
  ]);

  const explicitEvent = stringValue(item, [
    "Event",
    "EventName",
    "Activity",
    "Action",
    "ActionName",
    "ProcessName",
    "Description",
    "ActivityDescription",
    "TimelineDescription",
  ]);

  const isGenericUpdate = [
    "candidate application updated",
    "application updated",
    "status updated",
    "stage updated",
  ].includes(explicitEvent.trim().toLowerCase());
  const event = stage && (!explicitEvent || isGenericUpdate)
    ? `Moved to ${STATUS_TO_API_VALUE[normalizeCandidateStatus(stage)]}`
    : explicitEvent || "Candidate application updated";

  const actor = stringValue(
    item,
    [
      "ModifiedByName",
      "CreatedByName",
      "UpdatedByName",
      "StatusChangedByName",
      "ActionByName",
      "EmployeeName",
      "EmployeeFullName",
      "ModifiedBy",
      "CreatedBy",
      "UpdatedBy",
      "StatusChangedBy",
      "CreatedById",
      "ModifiedById",
    ],
    "System",
  );
  const actorId = /^\d+$/.test(actor) ? Number(actor) : 0;
  const actorName =
    actorId > 0 && actorId === getCurrentUserId()
      ? getCurrentUserName() || `User #${actor}`
      : actorId > 0
        ? `User #${actor}`
        : actor;

  return {
    event,
    by: actorName,
    date: formatCandidateDate(activityDate),
    timestamp: new Date(activityDate).getTime() || undefined,
  };
};

export const getCandidateAvatarUrl = (candidate: Candidate): string =>
  candidate.avatarUrl ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    candidate.name,
  )}&background=E0E7FF&color=4F46E5&bold=true`;

export const getCandidateStatusClass = (
  status: CandidateStatus,
): string => {
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

export const getRemarkAuthor = (remark: CandidateRemark): string => {
  const name = remark.CreatedByName?.trim();
  const designation = remark.CreatedByDesignation?.trim();

  if (name && designation) return `${name} - ${designation}`;
  if (name) return name;
  return remark.CreatedById > 0 ? `User #${remark.CreatedById}` : "System";
};
