import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBaselineCostPlanDocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    BaselineCostPlanDocumentCategory?: string
    BaselineCostPlanDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BaselineCostPlanDocumentCategoryMasterData {
    BaselineCostPlanDocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    BaselineCostPlanDocumentCategoryName: string,
    OrderBy: number | 0,
    DocumentCount: number | 0,
    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateBaselineCostPlanDocumentCategoryMasterRequest {
    BaselineCostPlanDocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    BaselineCostPlanDocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteBaselineCostPlanDocumentCategoryMasterRequest {
    BaselineCostPlanDocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type BaselineCostPlanDocumentCategoryMasterListResponse = ApiResponse<BaselineCostPlanDocumentCategoryMasterData[]>;
export type BaselineCostPlanDocumentCategoryMasterSaveReponse = ApiResponse<BaselineCostPlanDocumentCategoryMasterData[]>;
export type BaselineCostPlanDocumentCategoryMasterDeleteResponse = ApiResponse<number>;
