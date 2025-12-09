import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectRERADocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    ProjectRERADocumentId: number
    ProjectRERADocumentName?: string
    ProjectRERADocumentStatus?: string
    ProjectRERADocumentCategory?: string
    ProjectRERADocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ProjectRERADocumentData {
    ProjectRERADocumentId: number | null;
    Uniquekey: string | null;
    ProjectId: number | null;

    ProjectRERADocumentName: string | null;
    ProjectRERADocumentCategoryId: number | null;
    ProjectRERADocumentCategory: string | null;
    ProjectRERADocumentRemark: string | null;
    ProjectRERADocumentStatus: string | null;

    ProjectRERADocumentURL: string | null;
    RERAPortalScreenShotURL: string | null;

    ProjectRERADocumentApprovalStatus: string | null;
    IsApproval: boolean;

    IsMultiple: boolean | null;

    UploadedProjectRERADocumentCount: number | null;
    ApprovalPendingProjectRERADocumentCount: number | null;
    RejectedProjectRERADocumentCount: number | null;

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProjectRERADocumentRequest {
    ProjectRERADocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    ProjectRERADocumentCategoryId?: number | 0;
    ProjectRERADocumentName?: string | '';
    ProjectRERADocumentStatus?: string | '';
    IsMaster?: number | 0;
    ProjectRERADocumentURL?: File[] | null;
    RemoveProjectRERADocumentURL?: string | '';
    ProjectRERADocumentRemark?: string | '';
    RERAPortalScreenShotURL?: File[] | null;
    RemoveRERAPortalScreenShotURL?: string | '';
}

export interface DeleteProjectRERADocumentRequest {
    ProjectRERADocumentId: number,
    projectId: number;
    Uniquekey: string,
    ProjectRERADocumentCategoryId: number;
}

export type ProjectRERADocumentListResponse = ApiResponse<ProjectRERADocumentData[]>;
export type ProjectRERADocumentSaveReponse = ApiResponse<ProjectRERADocumentData[]>;
export type ProjectRERADocumentDeleteResponse = ApiResponse<number>;
