import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCallLogRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    CallLogId?: number
    MobileNumber?: number
    Name?: string
    RescheduleDateFromDate?: string
    RescheduleDateToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallLogData {
    CallLogId: number | 0
    ProjectId: number | 0
    MobileNumber: number | 0
    Uniquekey: string | null
    Status: string | null
    Name: string | null
    Remark: string | null
    RescheduleDate: string | null
    CallDate: string | null

    CallStatus: string | null
    SiteVisitProposedDate: string | null
    Budget?: string | null;
    Requirement?: string;
    RequirementType?: string;
    VillageMasterId: string | null;
    VillageName?: string
    
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
    Uniquekey: string | null
    ProjectId: number | 0
    Status: string | null
    Remark: string | null
    RescheduleDate: string | null
    SiteVisitProposedDate: string | null
    Budget?: string | null;
    Requirement?: string;
    RequirementType?: string;
    VillageMasterId: string | null;
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