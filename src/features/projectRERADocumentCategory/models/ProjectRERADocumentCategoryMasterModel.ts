import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectRERADocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    ProjectRERADocumentCategory?: string
    ProjectRERADocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ProjectRERADocumentCategoryMasterData {
    ProjectRERADocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    ProjectRERADocumentCategoryName: string,
    OrderBy: number | 0,
    DocumentCount: number | 0,
    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateProjectRERADocumentCategoryMasterRequest {
    ProjectRERADocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    ProjectRERADocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteProjectRERADocumentCategoryMasterRequest {
    ProjectRERADocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type ProjectRERADocumentCategoryMasterListResponse = ApiResponse<ProjectRERADocumentCategoryMasterData[]>;
export type ProjectRERADocumentCategoryMasterSaveReponse = ApiResponse<ProjectRERADocumentCategoryMasterData[]>;
export type ProjectRERADocumentCategoryMasterDeleteResponse = ApiResponse<number>;
