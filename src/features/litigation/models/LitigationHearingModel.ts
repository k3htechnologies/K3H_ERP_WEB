import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationLitigationHearingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    LitigationId?: number
    LitigationHearingId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LitigationHearingData {
    LitigationHearingId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    HearingDate: string | ''
    HearingAttachementURL: string | ''
    Remark: string | ''
}

export interface AddUpdateLitigationHearingRequest {
    LitigationHearingId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    HearingDate: string | ''
    HearingAttachementURL: string | null
    RemoveHearingAttachementURL: string | ''
    Remark: string | ''
}

export interface DeleteLitigationHearingRequest {
    LitigationHearingId: number
    Uniquekey: string
    LitigationId: number
    ProjectId: number
}

export type LitigationHearingListResponse = ApiResponse<LitigationHearingData[]>;
export type LitigationHearingSaveResponse = ApiResponse<LitigationHearingData[]>;
export type LitigationHearingDeleteResponse = ApiResponse<number[]>;


