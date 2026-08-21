import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTestDocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    TestDocumentId: number
    TestDocumentName?: string
    TestDocumentCategory?: string
    TestDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface TestDocumentData {
    TestDocumentId: number;
    Uniquekey: string;
    ProjectId: number;
    TestDocumentName: string;
    TestDocumentCategoryId: number;
    TestDocumentCategory: string;
    TestDocumentExpiryDate: string | null;
    TestDocumentRemark: string;
    TestDocumentURL: string;
    TestDocumentApprovalStatus: string;
    IsApproval: boolean;
    UploadedApprovalDocumentCount: number;
    ApprovalPendingApprovalDocumentCount: number;
    RejectedApprovalDocumentCount: number;
    ExpiredApprovalDocumentCount: number;
    IsMaster?: number | 0;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateTestDocumentRequest {
    TestDocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    TestDocumentCategoryId?: number | 0;
    TestDocumentName?: string | '';
    TestDocumentExpiryDate?: string | ''; 
    IsMaster?: number | 0;
    TestDocumentURL?: File[] | null; 
    RemoveTestDocumentURL?: string| '';
    TestDocumentRemark?: string | '';
}

export interface DeleteTestDocumentRequest {
    TestDocumentId: number,
    projectId: number;
    Uniquekey: string,
    TestDocumentCategoryId: number;
}

export type TestDocumentListResponse = ApiResponse<TestDocumentData[]>;
export type TestDocumentSaveReponse = ApiResponse<TestDocumentData[]>;
export type TestDocumentDeleteResponse = ApiResponse<number>;
