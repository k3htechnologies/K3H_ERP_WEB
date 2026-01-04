import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationApprovalDocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    ApprovalDocumentId: number
    ApprovalDocumentName?: string
    ApprovalDocumentStatus?: string
    ApprovalDocumentCategory?: string
    ApprovalDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ApprovalDocumentData {
    ApprovalDocumentId: number;
    Uniquekey: string;
    ProjectId: number;
    ApprovalDocumentName: string;
    ApprovalDocumentCategoryId: number;
    ApprovalDocumentCategory: string;
    ApprovalDocumentExpiryDate: string | null;
    ApprovalDocumentRemark: string;
    ApprovalDocumentStatus: string;
    ApprovalDocumentURL: string;
    ApprovalDocumentApprovalStatus: string;
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

export interface AddUpdateApprovalDocumentRequest {
    ApprovalDocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    ApprovalDocumentCategoryId?: number | 0;
    ApprovalDocumentName?: string | '';
    ApprovalDocumentExpiryDate?: string | ''; 
    ApprovalDocumentStatus?: string|'';
    IsMaster?: number | 0;
    ApprovalDocumentURL?: File[] | null; 
    RemoveApprovalDocumentURL?: string| '';
    ApprovalDocumentRemark?: string | '';
}

export interface DeleteApprovalDocumentRequest {
    ApprovalDocumentId: number,
    projectId: number;
    Uniquekey: string,
    ApprovalDocumentCategoryId: number;
}

export type ApprovalDocumentListResponse = ApiResponse<ApprovalDocumentData[]>;
export type ApprovalDocumentSaveReponse = ApiResponse<ApprovalDocumentData[]>;
export type ApprovalDocumentDeleteResponse = ApiResponse<number>;


