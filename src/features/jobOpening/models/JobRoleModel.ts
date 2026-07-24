export interface JobRole {
  JobRoleId: number;
  RoleName: string;
  DepartmentId: number;
  DepartmentName: string;
  Status: string;
  UniqueKey: string;
  CreatedAt: string;
  RoleDescription?: string;
  RoleResponsibility?: string;
  JobRequirement?: string;
  RoleQualification?: string;
  RoleSkills?: string;
  WorkMode?: string;
  ExperienceYears?: number;
  ExperienceMonths?: number;
  NumberOfOpenings?: number;
  WorkLocation?: string;
  EmploymentType?: string;
}

export type CandidateStatus =
  | "NEW"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED";

export interface Stage {
  id: string;
  name: string;
  status?: CandidateStatus;
}

export interface CandidateRemark {
  CandidateRemarkId: number;
  UniqueKey: string;
  CandidateId: number;
  Remark: string;
  ApplicantStatus: CandidateStatus;
  IsActive: boolean;
  IsDeleted: boolean | null;
  CreatedById: number;
  CreatedByName?: string;
  CreatedByDesignation?: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedDate: string | null;
}

export interface TimelineEvent {
  event: string;
  by: string;
  date: string;
  timestamp?: number;
}

export interface Candidate {
  id: string;
  candidateId: number;
  jobOpeningMasterId: number;
  uniqueKey: string;
  name: string;
  role: string;
  appliedRole: string;
  status: CandidateStatus;
  experience: string;
  company: string;
  appliedDate: string;
  matchScore: number;
  ResumeUrl: string;
  avatarUrl?: string;
  email: string;
  location: string;
  currentPosition: string;
  experienceDetail: string;
  expectedSalary: string;
  noticePeriod: string;
  skills: string[];
  education: {
    degree: string;
    school: string;
    duration: string;
  };
  remarks: CandidateRemark[];
  timeline: TimelineEvent[];
}

export interface JobRoleListRequest {
  PageNumber?: number;
  PageSize?: number;
  DepartmentId?: number;
  DepartmentName?: string;
  SortBy?: string;
  ExportType?: string;
}

export interface JobRoleListResponse {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  WarningMessage?: string[];
  Data: JobRole[] | null;
  TotalNumberOfRecord: number;
  HttpStatusCode: number;
}

export interface AddJobRoleResponse {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  Data?: JobRole;
  HttpStatusCode: number;
}

export interface UpdateJobRoleResponse {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  Data?: JobRole;
  HttpStatusCode: number;
}

export interface JobOpening {
  JobOpeningMasterId: number;
  UniqueKey: string;
  DepartmentMasterId: number;
  DepartmentName?: string;
  JobRoleMasterId: number;
  RoleName?: string;
  JobDescription?: string;
  JobResponsibilities?: string;
  JobRequirement?: string;
  JobQualification?: string;
  JobSkills?: string;
  WorkMode?: string;
  ExperienceYears?: number;
  ExperienceMonths?: number;
  NumberOfOpenings?: number;
  WorkLocation?: string;
  EmploymentType?: string;
  JobRoleStatus?: boolean;
  ApplicationsCount?: number;
  CreatedAt?: string;
  JobRoleId?: string;
  JobRoleName?: string;
}

export interface JobOpeningListRequest {
  PageNumber?: number;
  PageSize?: number;
  DepartmentMasterId?: number;
  DepartmentName?: string;
  JobRoleMasterId?: number;
  RoleName?: string;
  JobRoleStatus?: boolean;
  ExportType?: "Excel" | "PDF";
}

export interface JobOpeningListResponse {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  WarningMessage?: string[];
  Data: JobOpening[] | null;
  TotalNumberOfRecord: number;
  HttpStatusCode: number;
}

export type PullCandidatesResponse = CandidateApiResponse<unknown>;

export interface PullCandidatesRequest {
  DepartmentId?: number;
  FullName?: string;
  JobRoleMasterId?: number;
  CareerId?: number;
  ApplicationStatus?: number | string;
}

export interface DeleteJobOpeningRequest {
  JobOpeningMasterId: number;
  UniqueKey: string;
}

export interface DeleteJobOpeningResponse {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  HttpStatusCode: number;
}

export interface AddUpdateCandidateRemarkRequest {
  CandidateRemarkId: number;
  UniqueKey: string;
  CandidateId: number;
  Remark: string;
  ApplicantStatus: string;
}

export interface PullCandidateRemarkRequest {
  CandidateRemarkId: number;
  CandidateId: number;
}

export interface PullCandidateApplicationTimelineRequest {
  CandidateId: number;
}

export interface ScheduleInterviewRequest {
  InterviewId: number;
  UniqueKey: string;
  CandidateId: number;
  JobOpeningMasterId: number;
  Stage: string;
  InterviewPanel: string;
  InterviewDate: string;
  InterviewTime: string;
  AttachmentUrl: string;
  Remarks: string;
}

export interface PullCandidateInterviewRequest {
  PageSize?: number;
  PageNumber?: number;
  InterviewId?: number;
  InterviewDate?: string | number;
  Month?: number;
  Year?: number;
  CandidateName?: string;
  Stage?: string;
}

export interface UpdateCandidateStateRequest {
  CandidateId: number;
  UniqueKey: string;
  ApplicantStatus: string;
  ModifiedById: number;
  ModifiedDate: string;
}

export interface CandidateApiResponse<TData = unknown> {
  IsSuccess: boolean;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  WarningMessage?: string[];
  Data?: TData | null;
  TotalNumberOfRecord?: number;
  HttpStatusCode: number;
}

export type AddUpdateCandidateRemarkResponse = CandidateApiResponse<CandidateRemark | number>;
export type PullCandidateRemarkResponse = CandidateApiResponse<CandidateRemark[] | CandidateRemark>;
export type PullCandidateApplicationTimelineResponse =
  CandidateApiResponse<unknown>;
export type ScheduleInterviewResponse = CandidateApiResponse<unknown>;
export type PullCandidateInterviewResponse =
  CandidateApiResponse<unknown>;
export type UpdateCandidateStateResponse = CandidateApiResponse<unknown>;
