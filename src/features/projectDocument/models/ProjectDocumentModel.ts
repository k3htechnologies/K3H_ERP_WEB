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
    projectDocumentId: number;
    uniqueKey: string;
    projectId: number;
    projectDocumentName: string;
    projectDocumentCategoryId: number;
    projectDocumentCategory: string;
    projectDocumentExpiryDate: string | null;
    projectDocumentRemark: string;
    projectDocumentStatus: string;
    projectDocumentURL: string;
    projectDocumentApprovalStatus: string;
    isApproval: boolean;
    uploadedProjectDocumentCount: number;
    approvalPendingProjectDocumentCount: number;
    rejectedProjectDocumentCount: number;
    expiredProjectDocumentCount: number;
}

export interface AddUpdateProjectDocumentRequest {
    projectDocumentId: number;
    uniqueKey: string;
    projectId: number;
    projectDocumentCategoryId: number | null;
    projectDocumentName: string;
    projectDocumentExpiryDate: string | null; 
    projectDocumentStatus: string;
    isMaster: number | null;
    projectDocumentURL: File[] | null; 
    removeProjectDocumentURL: string;
    projectDocumentRemark: string;
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
