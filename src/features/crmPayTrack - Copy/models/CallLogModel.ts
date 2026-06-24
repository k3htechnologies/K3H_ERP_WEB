import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCallLogRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BookingId?: number | 0
    PayTrackCallLogId?: number
    ApplicantMobileNumber?: number
    ApplicantName?: string
    RescheduleDateFromDate?: string
    RescheduleDateToDate?: string
    CallStatus?: string
    CallPurpose?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallLogData {
    PayTrackCallLogId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    BookingId: number | 0
    ApplicantType: string | null
    ApplicantName: string | null
    ApplicantMobileNumber: number | 0
    CallDate: string | null
    Duration: string | null
    CallStatus: string | null
    CallPurpose: string | null
    Remark: string | null
    RescheduleDate: string | null
    RegistrationDate: string | null
    PromiseAmount: number | null
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
    BookingId: number | 0
    CallLogJSON: string | null
}

export interface UpdateCallLogRequest {
    PayTrackCallLogId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    Remark: string | null
    CallStatus: string
    CallPurpose: string
    RescheduleDate: string | null
    RegistrationDate: string | null
    PromiseAmount: number | null
}

export interface DeleteCallLogRequest {
    PayTrackCallLogId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type CallLogListResponse = ApiResponse<CallLogData[]>;
export type CallLogSaveResponse = ApiResponse<CallLogData[]>;
export type CallLogUpdateResponse = ApiResponse<CallLogData[]>;
export type CallLogDeleteResponse = ApiResponse<number[]>;