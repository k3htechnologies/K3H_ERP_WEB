import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationLeaveCreditDebitRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    LeaveCreditDebitId?: number
    LeavePeriodMode?: string
    FYyear?: number
    Month?: string
    DepartmentMasterId?: string
    EmployeeId?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LeaveBalanceType {
    LeaveTypeBalanceId: number
    LeaveTypeId: number | 0
    LeaveCredit: number | 0
    LeaveCreditDebitId: number | 0
}

export interface LeaveCreditDebitData {
    LeaveCreditDebitId: number | 0
    Uniquekey: string | ''
    LeavePeriodMode: string | ''
    FYyear: number | 0
    Month: string | ''
    DepartmentMasterId: string | ''
    EmployeeId: string | ''
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

export interface AddUpdateLeaveCreditDebitRequest {
    LeaveCreditDebitId?: number
    Uniquekey?: string
    LeavePeriodMode?: string
    FYyear?: number
    Month?: string
    DepartmentMasterId?: string
    EmployeeId?: string
    LeaveTypebalanceJSONList?: string
}

export interface DeleteLeaveCreditDebitRequest {
    LeaveCreditDebitId: number
    Uniquekey: string
}

export type LeaveCreditDebitListResponse = ApiResponse<LeaveCreditDebitData[]>;
export type LeaveCreditDebitSaveResponse = ApiResponse<LeaveCreditDebitData[]>;
export type LeaveCreditDebitDeleteResponse = ApiResponse<number>;




