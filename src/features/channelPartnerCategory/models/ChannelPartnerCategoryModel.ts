import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationchannelPartnerCategoryRequest {
    ProjectId?: number,
    ExportType?: "Excel" | "PDF";
}

export interface ChannelPartnerCategoryData {
    ProjectId: number | 0
    ChannelPartnerCategoryId: number | 0
    Uniquekey: string | null
    CategoryName: string | null
    BookingRevenue: number | 0
    NoOfEnquirys: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdatechannelPartnerCategoryRequest {
    ProjectId: number | 0
    ChannelPartnerCategoryJSON: string
}

export type ChannelPartnerCategoryListResponse = ApiResponse<ChannelPartnerCategoryData[]>
export type ChannelPartnerCategorySaveResponse = ApiResponse<ChannelPartnerCategoryData[]>