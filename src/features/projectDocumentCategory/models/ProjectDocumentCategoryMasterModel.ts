import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectDocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    ProjectDocumentCategory?: string
    ProjectDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ProjectDocumentCategoryMasterData {
    ProjectDocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    ProjectDocumentCategoryName: string,
    OrderBy: number | 0,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateProjectDocumentCategoryMasterRequest {
    ProjectDocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    ProjectDocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteProjectDocumentCategoryMasterRequest {
    ProjectDocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type ProjectDocumentCategoryMasterListResponse = ApiResponse<ProjectDocumentCategoryMasterData[]>;
export type ProjectDocumentCategoryMasterSaveReponse = ApiResponse<ProjectDocumentCategoryMasterData[]>;
export type ProjectDocumentCategoryMasterDeleteResponse = ApiResponse<number>;
