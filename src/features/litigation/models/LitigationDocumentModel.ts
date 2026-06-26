import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationLitigationDocumentRequest {
    PageSize: number
    PageNumber: number
    LitigationId?: number
    LitigationDocumentId?: number
    ProjectId?: number
    DocumentName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LitigationDocumentData {
    LitigationDocumentId: number | 0
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    DocumentName: string | null
    DocumentURL: string | ''
    LitigationHearingId: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null

}

export interface AddUpdateLitigationDocumentRequest {
    LitigationDocumentId: number | 0
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    DocumentName: string | null
    DocumentURL: string | null
    RemoveDocumentURL: string | ''
}

export interface DeleteLitigationDocumentRequest {
    LitigationDocumentId: number
    LitigationId: number
    Uniquekey: string
    ProjectId: number
}

export type LitigationDocumentListResponse = ApiResponse<LitigationDocumentData[]>;
export type LitigationDocumentSaveResponse = ApiResponse<LitigationDocumentData[]>;
export type LitigationDocumentDeleteResponse = ApiResponse<number[]>;

