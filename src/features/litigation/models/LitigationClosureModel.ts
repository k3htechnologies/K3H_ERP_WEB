import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationLitigationClosureRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    LitigationId?: number
    LitigationClosureId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LitigationClosureData {
    LitigationClosureId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    ClosureDate: string | ''
    ClosureAttachementURL: string | ''
    Remark: string | ''
    Conclusion: string | ''
}

export interface AddUpdateLitigationClosureRequest {
    LitigationClosureId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    ClosureDate: string | ''
    ClosureAttachementURL: string | null
    RemoveClosureAttachementURL: string | ''
    Remark: string | ''
    Conclusion: string | ''
}

export type LitigationClosureListResponse = ApiResponse<LitigationClosureData[]>;
export type LitigationClosureSaveResponse = ApiResponse<LitigationClosureData[]>;

