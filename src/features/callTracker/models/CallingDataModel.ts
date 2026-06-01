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
    Source?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CallingDataData {
    ProjectId: number | 0
    MobileNumber: string | ''
    Name: string | null
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

export interface AddUpdateCallingDataRequest {
    ProjectId: number | 0,
    CallingDataId: number | 0,
    Uniquekey: string | '';
    Name: string | '';
    MobileNumber: string | '',
    EmailId: string | '';
    Address: string | '';
    Source: string | '';
}

export type CallingDataListResponse = ApiResponse<CallingDataData[]>;
export type CallingDataSaveResponse = ApiResponse<CallingDataData[]>;

