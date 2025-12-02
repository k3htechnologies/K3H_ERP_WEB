import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectDocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    ProjectDocumentId: number
    ProjectDocumentName?: string
    ProjectDocumentStatus?: string
    ProjectDocumentCategory?: string
    ProjectDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ProjectDocumentData {
    ProjectDocumentId: number;
    Uniquekey: string;
    ProjectId: number;
    ProjectDocumentName: string;
    ProjectDocumentCategoryId: number;
    ProjectDocumentCategory: string;
    ProjectDocumentExpiryDate: string | null;
    ProjectDocumentRemark: string;
    ProjectDocumentStatus: string;
    ProjectDocumentURL: string;
    ProjectDocumentApprovalStatus: string;
    IsApproval: boolean;
    UploadedProjectDocumentCount: number;
    ApprovalPendingProjectDocumentCount: number;
    RejectedProjectDocumentCount: number;
    ExpiredProjectDocumentCount: number;

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProjectDocumentRequest {
    ProjectDocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    ProjectDocumentCategoryId?: number | 0;
    ProjectDocumentName?: string | '';
    ProjectDocumentExpiryDate?: string | ''; 
    ProjectDocumentStatus?: string|'';
    IsMaster?: number | 0;
    ProjectDocumentURL?: File[] | null; 
    RemoveProjectDocumentURL?: string| '';
    ProjectDocumentRemark?: string | '';
}

export interface DeleteProjectDocumentRequest {
    ProjectDocumentId: number,
    projectId: number;
    Uniquekey: string,
    ProjectDocumentCategoryId: number;
}

export type ProjectDocumentListResponse = ApiResponse<ProjectDocumentData[]>;
export type ProjectDocumentSaveReponse = ApiResponse<ProjectDocumentData[]>;
export type ProjectDocumentDeleteResponse = ApiResponse<number>;
