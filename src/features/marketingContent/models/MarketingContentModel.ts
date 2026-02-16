import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMarketingContentRequest {
    PageSize: number
    PageNumber: number
    MarketingContentFolderId?: number
    MarketingContentId?: number
    Title?: string
    ProjectId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface MarketingContentData {
    MarketingContentFolderId: number | null
    MarketingContentId: number | null
    Uniquekey: string | null
    Title: string | null
    Remark: string | null
    ProjectId: number | null
    MarketingContentURL: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateMarketingContentRequest {
    MarketingContentFolderId: number | 0
    MarketingContentId: number | 0
    Uniquekey: string | null
    Title: string | null
    Remark: string | null
    MarketingContentURL: string | null
    RemoveMarketingContentURL: string | null
    ProjectId: number | 0
}
export interface DeleteMarketingContentRequest {
    MarketingContentFolderId: number
    MarketingContentId: number
    Uniquekey: string
    ProjectId: number
}

export type MarketingContentListResponse = ApiResponse<MarketingContentData[]>;
export type MarketingContentSaveResponse = ApiResponse<MarketingContentData[]>;
export type MarketingContentDeleteResponse = ApiResponse<number>