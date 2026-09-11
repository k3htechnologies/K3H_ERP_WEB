import type { ApiResponse } from "@/core/api/ApiResponse"

export interface CandidateApplicationStageData {
    Stage?: string | null
    TotalApplications?: number | null
}

export interface FilterWithPaginationCandidateApplicationStageRequest {
    DepartmentId?: number
    JobOpeningId?: number
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
    CreatedBy?: string | null
    CreatedDate: string
    ModifiedById: number
    ModifiedDate: string | null
    CreatedByDesignationName: string | null
}

export interface CandidateApplicationTimelineData {
    Stage?: string | null
    CandidateId?: number
    CreatedDate?: string | null
    CreatedById?: number | null
    CreatedBy?: string | null
    ApplicantStatus?: string | null
    ModifiedDate?: string | null
}

export interface FilterWithPaginationCandidateRequest {
    ApplicationStatus?: string
    CandidateId?: number
    FullName?: string
    DepartmentId?: number
    JobRoleMasterId?: number
    CareerId?: number
    JobOpeningId?: number
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
}

export interface FilterWithPaginationCandidateApplicationTimelineRequest {
    CandidateId: number
}

export type CandidateListResponse = ApiResponse<CandidateData[]>
export type CandidateRemarkSaveResponse = ApiResponse<number>
export type CandidateRemarkListResponse = ApiResponse<CandidateRemarkData[]>
export type CandidateStageSaveResponse = ApiResponse<number>
export type CandidateApplicationTimelineListResponse = ApiResponse<CandidateApplicationTimelineData[]>
export type CandidateApplicationStageListResponse = ApiResponse<CandidateApplicationStageData[]>
