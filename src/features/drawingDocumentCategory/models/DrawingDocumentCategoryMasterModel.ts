import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationDrawingDocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    DrawingDocumentCategory?: string
    DrawingDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface DrawingDocumentCategoryMasterData {
    DrawingDocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    DrawingDocumentCategoryName: string,
    OrderBy: number | 0,
    DocumentCount: number | 0,
    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateDrawingDocumentCategoryMasterRequest {
    DrawingDocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    DrawingDocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteDrawingDocumentCategoryMasterRequest {
    DrawingDocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type DrawingDocumentCategoryMasterListResponse = ApiResponse<DrawingDocumentCategoryMasterData[]>;
export type DrawingDocumentCategoryMasterSaveReponse = ApiResponse<DrawingDocumentCategoryMasterData[]>;
export type DrawingDocumentCategoryMasterDeleteResponse = ApiResponse<number>;
