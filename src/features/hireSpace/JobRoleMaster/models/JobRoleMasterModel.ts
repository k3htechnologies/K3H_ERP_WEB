import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationJobRoleMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    JobRoleId?: number
    DepartmentId?: number
    DepartmentName?: string
    RoleName?: string
    RoleSkills?: string
    IsActive?: boolean
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface JobDepartmentData {
    RoleId: number
    DepartmentId: number
    DepartmentName: string
    TotalRoles: number
}

export interface JobRoleSkillOption {
    name?: string
    label?: string
}

export interface JobRoleMasterData {
    JobRoleId: number
    UniqueKey: string
    DepartmentId: number
    DepartmentName: string
    RoleName: string
    RoleDescription: string
    RoleQualification: string
    RoleResponsibility: string
    JobRequirement: string
    RoleSkills: string | JobRoleSkillOption[] | null
    IsCopy?: string
    IsActive?: boolean
    Status?: string
    WorkMode?: string
    ExperienceYears?: number
    ExperienceMonths?: number
    NumberOfOpenings?: number
    WorkLocation?: string
    EmploymentType?: string
    CreatedAt?: string
}

export interface AddUpdateJobRoleMasterRequest {
    JobRoleId: number
    UniqueKey: string
    DepartmentId: number
    RoleName: string
    RoleDescription: string
    RoleQualification: string
    RoleResponsibility: string
    JobRequirement: string
    RoleSkills: string
    IsCopy: string
}

export interface DeleteJobRoleMasterRequest {
    JobRoleId: number
    UniqueKey: string
}

export type JobRoleStatusFilter = "active" | "inactive" | ""

export type JobDepartmentListResponse = ApiResponse<JobDepartmentData[]>
export type JobRoleMasterListResponse = ApiResponse<JobRoleMasterData[]>
export type JobRoleMasterSaveResponse = ApiResponse<JobRoleMasterData[]>
export type JobRoleMasterDeleteResponse = ApiResponse<number>
