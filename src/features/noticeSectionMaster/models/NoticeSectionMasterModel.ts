import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationNoticeSectionMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    NoticeSectionMasterId?: number
    NoticeType?: string
    NoticeSection?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}


export interface NoticeSectionMasterData {
    NoticeSectionMasterId: number | 0
    Uniquekey: string | ''
    NoticeType: string | ''
    NoticeSection: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateNoticeSectionMasterRequest {
    NoticeSectionMasterId?: number
    Uniquekey?: string
    NoticeType: string
    NoticeSection: string
}

export interface DeleteNoticeSectionMasterRequest {
    NoticeSectionMasterId: number
    Uniquekey: string
}


export type NoticeSectionMasterListResponse = ApiResponse<NoticeSectionMasterData[]>;
export type NoticeSectionMasterSaveResponse = ApiResponse<NoticeSectionMasterData[]>;
export type NoticeSectionMasterDeleteResponse = ApiResponse<number>;
