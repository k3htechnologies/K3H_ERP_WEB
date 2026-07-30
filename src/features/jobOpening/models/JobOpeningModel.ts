import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationJobOpeningRequest {
    PageNumber: number
    PageSize: number
    IsCheckPermission?: boolean
    JobOpeningMasterId?: number
    DepartmentMasterId?: number
    DepartmentName?: string
    JobRoleMasterId?: number
    RoleName?: string
    JobRoleStatus?: boolean
    ExportType?: 'Excel' | 'PDF'
}

export interface JobOpeningData {
    JobOpeningMasterId: number
    UniqueKey: string
    DepartmentMasterId: number
    DepartmentName?: string
    JobRoleMasterId: number
    RoleName?: string
    JobRoleName?: string
    JobDescription?: string
    JobResponsibilities?: string
    JobRequirement?: string
    JobQualification?: string
    JobSkills?: string
    WorkMode?: string
    ExperienceYears?: number
    ExperienceMonths?: number
    NumberOfOpenings?: number
    WorkLocation?: string
    EmploymentType?: string
    JobRoleStatus?: boolean
    ApplicationCount?: number
    ApplicationsCount?: number
    CreatedAt?: string
}

export interface AddUpdateJobOpeningRequest {
    JobOpeningMasterId: number
    UniqueKey: string
    DepartmentMasterId: number
    JobRoleMasterId: number
    JobDescription: string
    JobResponsibilities: string
    JobRequirement: string
    JobQualification: string
    JobSkills: string
    WorkMode: string
    ExperienceYears: number
    ExperienceMonths: number
    NumberOfOpenings: number
    WorkLocation: string
    EmploymentType: string
    JobRoleStatus: boolean
}

export interface DeleteJobOpeningRequest {
    JobOpeningMasterId: number
    UniqueKey: string
}

export type CandidateStatus =
    | 'NEW'
    | 'SCREENING'
    | 'SHORTLISTED'
    | 'INTERVIEW'
    | 'SELECTED'
    | 'REJECTED'

export interface Stage {
    id: string
    name: string
    status?: CandidateStatus
}

export interface CandidateRemark {
    CandidateRemarkId: number
    UniqueKey: string
    CandidateId: number
    Remark: string
    ApplicantStatus: CandidateStatus
    IsActive: boolean
    IsDeleted: boolean | null
    CreatedById: number
    CreatedByName?: string
    CreatedByDesignation?: string
    CreatedDate: string
    ModifiedById: number
    ModifiedDate: string | null
}

export interface TimelineEvent {
    event: string
    by: string
    date: string
    timestamp?: number
}

export interface Candidate {
    id: string
    candidateId: number
    jobOpeningMasterId: number
    uniqueKey: string
    name: string
    role: string
    appliedRole: string
    status: CandidateStatus
    experience: string
    company: string
    appliedDate: string
    matchScore: number
    ResumeUrl: string
    avatarUrl?: string
    email: string
    location: string
    currentPosition: string
    experienceDetail: string
    expectedSalary: string
    noticePeriod: string
    skills: string[]
    education: {
        degree: string
        school: string
        duration: string
    }
    remarks: CandidateRemark[]
    timeline: TimelineEvent[]
}

export interface CandidateData {
    [key: string]: unknown
    CandidateId?: number | null
    CareerId?: number | null
    UniqueKey?: string | null
    JobOpeningMasterId?: number | null
    FullName?: string | null
    ApplicationStatus?: string | null
    YearsOfExperience?: number | null
    MonthsOfExperience?: number | null
    CurrentRole?: string | null
    JobRoleName?: string | null
    CurrentCompany?: string | null
    CreatedDate?: string | null
    MatchScore?: number | null
    ResumeUrl?: string | null
    Photograph?: string | null
    Email?: string | null
    Location?: string | null
    ExpectedSalary?: number | null
    NoticePeriod?: number | null
    JobSkills?: string | null
    HighestQualification?: string | null
    UniversityInstitution?: string | null
    GraduationYear?: string | null
    CreatedByName?: string | null
}

export interface CandidateRemarkData {
    [key: string]: unknown
    CandidateRemarkId: number
    UniqueKey: string
    CandidateId: number
    Remark: string
    ApplicantStatus: string
    IsActive: boolean
    IsDeleted: boolean | null
    CreatedById: number
    CreatedByName?: string
    CreatedByDesignation?: string
    CreatedDate: string
    ModifiedById: number
    ModifiedDate: string | null
}

export interface CandidateApplicationTimelineData {
    [key: string]: unknown
}

export interface CandidateInterviewData {
    [key: string]: unknown
}

export interface PullCandidatesRequest {
    DepartmentId?: number
    FullName?: string
    JobRoleMasterId?: number
    CareerId?: number
    ApplicationStatus?: number | string
}

export interface AddUpdateCandidateRemarkRequest {
    CandidateRemarkId: number
    UniqueKey: string
    CandidateId: number
    Remark: string
    ApplicantStatus: string
}

export interface PullCandidateRemarkRequest {
    CandidateRemarkId: number
    CandidateId: number
}

export interface UpdateCandidateStageRequest {
    CandidateId: number
    UniqueKey: string
    ApplicantStatus: string
    ModifiedById: number
    ModifiedDate: string
}

export interface PullCandidateApplicationTimelineRequest {
    CandidateId: number
}

export interface ScheduleInterviewRequest {
    InterviewId: number
    UniqueKey: string
    CandidateId: number
    JobOpeningMasterId: number
    Stage: string
    InterviewPanel: string
    InterviewDate: string
    InterviewTime: string
    AttachmentUrl: string
    Remarks: string
}

export interface PullCandidateInterviewRequest {
    PageSize?: number
    PageNumber?: number
    InterviewId?: number
    InterviewDate?: string | number
    Month?: number
    Year?: number
    CandidateName?: string
    Stage?: string
}

export type JobOpeningListResponse = ApiResponse<JobOpeningData[]>;
export type JobOpeningSaveResponse = ApiResponse<JobOpeningData[]>;
export type JobOpeningDeleteResponse = ApiResponse<number>;
export type PullCandidatesResponse = ApiResponse<CandidateData[]>;
export type AddUpdateCandidateRemarkResponse = ApiResponse<number>;
export type PullCandidateRemarkResponse = ApiResponse<CandidateRemarkData[]>;
export type UpdateCandidateStageResponse = ApiResponse<number>;
export type PullCandidateApplicationTimelineResponse = ApiResponse<CandidateApplicationTimelineData[]>;
export type ScheduleInterviewResponse = ApiResponse<number>;
export type PullCandidateInterviewResponse = ApiResponse<CandidateInterviewData[]>;
export type JobOpening = JobOpeningData;
