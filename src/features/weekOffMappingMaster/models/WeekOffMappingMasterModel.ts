import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationWeekOffMappingMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    WeekOffPolicyMasterMappingId?: number
    WeekOffPolicyName?: string
    DepartmentName?: string
    EmployeeName?: string
    EmployeeId?: number
    IsCheckEmployeeWeekOffPolicy?:boolean
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface WeekOffMappingMasterData {
    WeekOffPolicyMasterMappingId: number | 0
    Uniquekey: string | null
    DepartmentMasterId: string | ''
    DepartmentName: string | ''
    EmployeeId: string | ''
    EmployeeName: string | ''
    WeekOffPolicyMasterId: number | 0
    WeekOffPolicyCode: string | ''
    WeekOffPolicyName: string | ''
    WeekDays: number | 0
    WeekDaysStartsOn: string | ''
    WeeklyOff: string | ''
    WeeklyOff2: string | ''
    WeeklyOff2Type: string | ''
    NotApplicableForMonths: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateWeekOffMappingMasterRequest {
    WeekOffPolicyMasterMappingId: number | 0
    Uniquekey: string | null
    WeekOffPolicyMasterId: number | 0
    DepartmentMasterId: string | ''
    EmployeeId: string | ''
}

export interface DeleteWeekOffMappingMasterRequest {
    WeekOffPolicyMasterMappingId: number
    UniqueKey: string
}

export type WeekOffMappingMasterListResponse = ApiResponse<WeekOffMappingMasterData[]>;
export type WeekOffMappingMasterSaveResponse = ApiResponse<WeekOffMappingMasterData[]>;
export type WeekOffMappingMasterDeleteResponse = ApiResponse<number>;
