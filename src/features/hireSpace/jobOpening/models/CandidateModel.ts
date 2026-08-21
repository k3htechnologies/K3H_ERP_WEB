import type { ApiResponse } from "@/core/api/ApiResponse"

export type CandidateStatus = "NEW" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED"

export interface Stage {
    id: string
    name: string
    status?: CandidateStatus
}

export interface CandidateData {
    CandidateId: number
    UniqueKey: string
    FullName: string
    Email?: string | null
    MobileNo?: string | null
    Photograph?: string | null
    ResumeUrl?: string | null
    Skills?: string | null
    WorkLocation?: string | null
    SourceId?: number | null
    HighestQualification?: string | null
    UniversityInstitution?: string | null
    GraduationYear?: number | null
    PercentageCgpa?: number | null
    CurrentCompany?: string | null
    CurrentRole?: string | null
    YearsOfExperience?: number | null
    ReasonForChange?: string | null
    CurrentSalary?: number | null
    ExpectedSalary?: number | null
    NoticePeriod?: number | null
    ApplicationStatus?: string | null
    IsActive?: boolean | null
    IsDeleted?: boolean | null
    CreatedById?: number | null
    CreatedDate?: string | null
    ModifiedById?: number | null
    ModifiedDate?: string | null
    DeletedById?: number | null
    DeletedDate?: string | null
}

export interface CandidateRemarkData {
    CandidateRemarkId: number
    UniqueKey: string
    CandidateId: number
    Remark: string
    ApplicantStatus: string
    IsActive: boolean
    IsDeleted: boolean | null
    CreatedById: number
    CreatedByName?: string
    EmployeeName?: string
    AuthorName?: string
    CreatedBy?: string
    CreatedByDesignation?: string
    DesignationName?: string
    RoleName?: string
    CreatedDate: string
    ModifiedById: number
    ModifiedDate: string | null
}

export interface CandidateApplicationTimelineData {
    Event?: string | null
    Description?: string | null
    ApplicantStatus?: string | null
    CreatedDate?: string | null
    ActivityDate?: string | null
    ModifiedDate?: string | null
    CreatedByName?: string | null
    ModifiedByName?: string | null
    EmployeeName?: string | null
}

export type CandidateDetailsTab = "Overview" | "Remark" | "Timeline"

export interface FilterWithPaginationCandidateRequest {
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

export interface FilterWithPaginationCandidateRemarkRequest {
    CandidateRemarkId: number
    CandidateId: number
}

export interface AddUpdateCandidateStageRequest {
    CandidateId: number
    UniqueKey: string
    ApplicantStatus: string
    ModifiedById: number
    ModifiedDate: string
}

export interface FilterWithPaginationCandidateApplicationTimelineRequest {
    CandidateId: number
}

export type CandidateListResponse = ApiResponse<CandidateData[]>
export type CandidateRemarkSaveResponse = ApiResponse<number>
export type CandidateRemarkListResponse = ApiResponse<CandidateRemarkData[]>
export type CandidateStageSaveResponse = ApiResponse<number>
export type CandidateApplicationTimelineListResponse = ApiResponse<CandidateApplicationTimelineData[]>
