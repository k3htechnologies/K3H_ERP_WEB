import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCallingDataRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MobileNumber?: string
    Name?: string
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallingDataData {
    ProjectId: number | 0
    MobileNumber: number | 0
    Name: string | null
    Address: string | null
    EmailId: string | null
    FromDate: number | 0
    ToDate: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export type CallingDataListResponse=ApiResponse<CallingDataData[]>;
