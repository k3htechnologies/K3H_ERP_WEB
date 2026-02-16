import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCallLogRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    CallLogId?: number
    MobileNumber?: number
    Name?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallLogData {
    CallLogId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    MobileNumber: number | 0
    Status: string | null
    Name: string | null
    CallerName: string | null
    ReceiverName: string | null
    CallDateTime: string | null
    RescheduleDateTime: string | null
    Duration: number | 0
    Remark: string | null
    RescheduleDate: string | null
    CallDate: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddCallLogRequest {
    ProjectId: number | 0
    CallLogJSON: string | null
}

export interface UpdateCallLogRequest {
    CallLogId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    Remark: string | null

    RescheduleDate: string | null
}

export interface DeleteCallLogRequest {
    CallLogId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type CallLogListResponse = ApiResponse<CallLogData[]>;
export type CallLogSaveResponse = ApiResponse<CallLogData[]>;
export type CallLogUpdateResponse = ApiResponse<CallLogData[]>;
export type CallLogDeleteResponse = ApiResponse<number[]>;