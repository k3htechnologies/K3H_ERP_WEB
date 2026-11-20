import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCallMonitoring {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    Id?: number
    CallMonitoringId?: number
    PageName?: string
    Name?: string
    MobileNumber?: string
    CallStatus?: string
    CallPurpose?: string
    RescheduleDateFromDate?: string
    RescheduleDateToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallMonitoringData {
    CallMonitoringId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    Id: number | 0
    PageName: string | null
    Name: string | null
    MobileNumber: string | null
    CallDate: string | null
    Duration: string | null
    CallStatus: string | null
    CallPurpose: string | null
    Remark: string | null
    RescheduleDate: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddCallMonitoring {
    ProjectId: number | 0
    Id: number | 0
    PageName: string | null
    CallLogJSON: string | null
}

export interface UpdateCallMonitoring {
    CallMonitoringId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    CallStatus: string | null
    Remark: string | null
    CallPurpose: string | null
    RescheduleDate: string | null
}

export interface DeleteCallMonitoring {
    CallMonitoringId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type CallMonitoringListResponse = ApiResponse<CallMonitoringData[]>;
export type CallMonitoringSaveResponse = ApiResponse<CallMonitoringData[]>;
export type CallMonitoringUpdateResponse = ApiResponse<CallMonitoringData[]>;
export type CallMonitoringDeleteResponse = ApiResponse<number>;