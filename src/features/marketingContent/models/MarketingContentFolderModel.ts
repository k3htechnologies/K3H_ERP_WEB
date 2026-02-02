import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMarketingContentFolderRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MarketingContentFolderId?: number
    MarketingContentFolderName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface MarketingContentFolderData {
    MarketingContentFolderId: number | null
    Uniquekey: string | null
    ProjectId: number | null
    MarketingContentFolderName: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateMarketingContentFolderRequest {
    MarketingContentFolderId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    MarketingContentFolderName: string | null
}

export interface DeleteMarketingContentFolderRequest {
    MarketingContentFolderId: number
    Uniquekey: string
    ProjectId: number
}

export type MarketingContentFolderListResponse = ApiResponse<MarketingContentFolderData[]>;
export type MarketingContentFolderSaveResponse = ApiResponse<MarketingContentFolderData[]>;
export type MarketingContentFolderDeleteResponse = ApiResponse<number>