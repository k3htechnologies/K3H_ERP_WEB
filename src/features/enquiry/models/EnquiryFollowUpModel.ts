import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEnquiryFollowUpRequest {
    PageSize: number
    PageNumber: number
    EnquiryFollowUpId?: number
    ProjectId?: number
    EnquiryId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface EnquiryFollowUpData {
    EnquiryFollowUpId: number | null
    Uniquekey: string | null
    EnquiryId?: number
    Status: string | null
    NextFollowUpDate: string | null
    Remark: string | null
    CreatedById?: number | 0
    CreatedBy?: string | null
    CreatedDate?: string | null
    ModifiedById?: number | 0
    ModifiedBy?: string
    ModifiedDate?: string | null
}

export interface AddUpdateEnquiryFollowUpRequest {
    EnquiryFollowUpId: number | null
    Uniquekey: string | null
    ProjectId: number
    EnquiryId: number
    Status?: string | null
    NextFollowUpDate?: string | null
    Remark?: string | null
}

export interface DeleteEnquiryFollowUpRequest {
    EnquiryFollowUpId: number
    Uniquekey: string
    EnquiryId: number
    ProjectId: number
}

export type EnquiryFollowUpListResponse = ApiResponse<EnquiryFollowUpData[]>
export type EnquiryFollowUpSaveResponse = ApiResponse<EnquiryFollowUpData[]>
export type EnquiryFollowUpDeleteResponse = ApiResponse<number>