import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationLeaveEncashmentMasterRequest {
    PageSize: number
    PageNumber: number
    LeaveEncashmentMasterSlabsId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LeaveEncashmentMasterData {
    LeaveEncashmentMasterSlabsId: number | 0
    Uniquekey: string | null
    EarningMasterName: string | ''
    MinSalary: number | 0
    MaxSalary: number | 0
    EncashmentRate: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateLeaveEncashmentMasterRequest {
    LeaveEncashmentMasterSlabsId: number | 0
    Uniquekey: string | null
    EarningMasterName: string | null
    MinSalary: number | 0
    MaxSalary: number | 0
    EncashmentRate: number | 0
}

export interface DeleteLeaveEncashmentMasterRequest {
    LeaveEncashmentMasterSlabsId: number
    UniqueKey: string
}

export type LeaveEncashmentMasterListResponse = ApiResponse<LeaveEncashmentMasterData[]>;
export type LeaveEncashmentMasterSaveResponse = ApiResponse<LeaveEncashmentMasterData[]>;
export type LeaveEncashmentMasterDeleteResponse = ApiResponse<number>;
