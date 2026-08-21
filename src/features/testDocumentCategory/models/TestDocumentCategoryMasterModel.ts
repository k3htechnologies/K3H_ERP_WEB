import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTestDocumentCategoryMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    TestDocumentCategory?: string
    TestDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface TestDocumentCategoryMasterData {
    TestDocumentCategoryId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    TestDocumentCategoryName: string,
    OrderBy: number | 0,
    DocumentCount: number | 0,
    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateTestDocumentCategoryMasterRequest {
    TestDocumentCategoryId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    TestDocumentCategory: string,
    OrderBy: number | 0,
}

export interface DeleteTestDocumentCategoryMasterRequest {
    TestDocumentCategoryId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type TestDocumentCategoryMasterListResponse = ApiResponse<TestDocumentCategoryMasterData[]>;
export type TestDocumentCategoryMasterSaveReponse = ApiResponse<TestDocumentCategoryMasterData[]>;
export type TestDocumentCategoryMasterDeleteResponse = ApiResponse<number>;
