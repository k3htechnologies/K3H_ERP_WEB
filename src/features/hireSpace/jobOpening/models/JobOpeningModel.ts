import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationJobOpeningRequest {
    PageSize: number
    PageNumber: number
    JobOpeningMasterId?: number
    DepartmentMasterId?: number
    JobRoleMasterId?: number
    WorkMode?: string
    EmploymentType?: string
    ExperienceYears?: number
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
    CreatedAt?: string
    TotalApplications: number
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

export type JobOpeningListResponse = ApiResponse<JobOpeningData[]>
export type JobOpeningSaveResponse = ApiResponse<JobOpeningData[]>
export type JobOpeningDeleteResponse = ApiResponse<number>
