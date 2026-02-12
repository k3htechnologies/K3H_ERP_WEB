import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationLeaveCreditConfigurationRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    LeaveCreditConfigurationId?: number
    LeavePeriodMode?: string
    StartDate?: string
    EndDate?: string
    DepartmentName?: string
    DesignationName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LeaveBalanceType {
    LeaveTypeBalanceId: number
    LeaveTypeId: number | 0
    LeaveCredit: number | 0
    LeaveTypeName: string | ''
    LeaveCreditConfigurationId: number | 0
}

export interface LeaveCreditConfigurationData {
    LeaveCreditConfigurationId: number | 0
    Uniquekey: string | ''
    LeavePeriodMode: string | ''
    FYyear: number | 0
    Month: string | ''
    FinancialYearStartDate: string | null
    FinancialYearEndDate: string | null
    DepartmentMasterId: number | 0
    DepartmentName: string | ''
    DesignationName: string | ''
    DesignationId: string | ''
    LeaveBalanceType: LeaveBalanceType[] | []
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateLeaveCreditConfigurationRequest {
    LeaveCreditConfigurationId?: number
    Uniquekey?: string
    LeavePeriodMode?: string
    StartDate?: string | null
    EndDate?: string | null
    DepartmentMasterId?: number
    DesignationId?: string
    LeaveTypebalanceJSONList?: string
}

export interface DeleteLeaveCreditConfigurationRequest {
    LeaveCreditConfigurationId: number
    Uniquekey: string
}

export type LeaveCreditConfigurationListResponse = ApiResponse<LeaveCreditConfigurationData[]>;
export type LeaveCreditConfigurationSaveResponse = ApiResponse<LeaveCreditConfigurationData[]>;
export type LeaveCreditConfigurationDeleteResponse = ApiResponse<number>;



