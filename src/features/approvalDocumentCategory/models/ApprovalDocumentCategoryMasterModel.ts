import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationApprovalDocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    ApprovalDocumentCategory?: string
    ApprovalDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ApprovalDocumentCategoryMasterData {
    ApprovalDocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    ApprovalDocumentCategoryName: string,
    OrderBy: number | 0,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateApprovalDocumentCategoryMasterRequest {
    ApprovalDocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    ApprovalDocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteApprovalDocumentCategoryMasterRequest {
    ApprovalDocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type ApprovalDocumentCategoryMasterListResponse = ApiResponse<ApprovalDocumentCategoryMasterData[]>;
export type ApprovalDocumentCategoryMasterSaveReponse = ApiResponse<ApprovalDocumentCategoryMasterData[]>;
export type ApprovalDocumentCategoryMasterDeleteResponse = ApiResponse<number>;


