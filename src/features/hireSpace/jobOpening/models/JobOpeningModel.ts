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
    ExportType?: "Excel" | "PDF"
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

export type JobOpeningStatusFilter = "active" | "inactive" | ""

export interface JobOpeningFilters {
    RoleName?: string
    Department?: string
    Status?: JobOpeningStatusFilter
}

export type JobOpeningListResponse = ApiResponse<JobOpeningData[]>
export type JobOpeningSaveResponse = ApiResponse<JobOpeningData[]>
export type JobOpeningDeleteResponse = ApiResponse<number>
