import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationLeaveTypeMasterRequest {
    PageSize: number
    PageNumber: number
    LeaveTypeMasterId?: number
    LeaveType?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LeaveTypeMasterData {
    LeaveTypeMasterId: number | 0
    Uniquekey: string | null

    LeaveType: string | ''
    LeaveTypeCode: string | ''

    IsCarryForward: boolean | false
    MaxCarryForward: number | 0

    IsEncashable: boolean | false
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateLeaveTypeMasterRequest {
    LeaveTypeMasterId: number | 0
    Uniquekey: string | null

    LeaveType: string | ''
    LeaveTypeCode: string | ''

    IsCarryForward: boolean | false
    MaxCarryForward: number | 0
    IsEncashable: boolean | false
}

export interface DeleteLeaveTypeMasterRequest {
    LeaveTypeMasterId: number
    UniqueKey: string
}

export type LeaveTypeMasterListResponse = ApiResponse<LeaveTypeMasterData[]>;
export type LeaveTypeMasterSaveResponse = ApiResponse<LeaveTypeMasterData[]>;
export type LeaveTypeMasterDeleteResponse = ApiResponse<number>;
