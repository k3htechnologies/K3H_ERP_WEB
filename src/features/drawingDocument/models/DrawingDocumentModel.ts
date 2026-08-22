import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationDrawingDocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    DrawingDocumentId: number
    DrawingDocumentName?: string
    DrawingDocumentStatus?: string
    DrawingDocumentCategory?: string
    DrawingDocumentCategoryId?: number
    BuildingNumber?: string;
    Wing?: string;
    Floor?: string;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface DrawingDocumentData {
    DrawingDocumentId: number;
    Uniquekey: string;
    ProjectId: number;
    DrawingDocumentName: string;
    DrawingDocumentCategoryId: number;
    DrawingDocumentCategory: string;
    DrawingDocumentRevisionDate: string | null;
    DrawingDocumentRemark: string;
    DrawingDocumentStatus: string;
    DrawingDocumentURL: string;
    DrawingDocumentDWGURL: string;
    ApprovalStatus: string;
    IsApproval: boolean;
    UploadedApprovalDocumentCount: number;
    ApprovalPendingApprovalDocumentCount: number;
    RejectedApprovalDocumentCount: number;
    InventoryFloorId?: string | '';
    Floor?: string | '';
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

export interface AddUpdateDrawingDocumentRequest {
    DrawingDocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    DrawingDocumentCategoryId?: number | 0;
    DrawingDocumentName?: string | '';
    DrawingDocumentRevisionDate?: string | '';
    DrawingDocumentStatus?: string | '';
    IsMaster?: number | 0;
    DrawingDocumentURL?: File[] | null;
    RemoveDrawingDocumentURL?: string | '';
    DrawingDocumentDWGURL?: File[] | null;
    RemoveDrawingDocumentDWGURL?: string | '';
    DrawingDocumentRemark?: string | '';
    InventoryFloorId?: string | '';
}

export interface DeleteDrawingDocumentRequest {
    DrawingDocumentId: number,
    projectId: number;
    Uniquekey: string,
    DrawingDocumentCategoryId: number;
}

export interface FilterWithPaginationInventoryDrawingDocument {
    ProjectId: number
    InventoryFloorId?: number
    Floor?: string;
    SortBy?: string
}

export interface InventoryDrawingDocumentData {
    DrawingDocumentName: string;
    DrawingDocumentCategory: string;
    DrawingDocumentURL: string;
    DrawingDocumentDWGURL: string;
    DrawingDocumentRevisionDate: string | null;
    DrawingDocumentRemark: string;
    DrawingDocumentStatus: string;
    ApprovalStatus: string;
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export type DrawingDocumentListResponse = ApiResponse<DrawingDocumentData[]>;
export type DrawingDocumentSaveReponse = ApiResponse<DrawingDocumentData[]>;
export type DrawingDocumentDeleteResponse = ApiResponse<number>;
export type InventoryDrawingDocumentListResponse = ApiResponse<InventoryDrawingDocumentData[]>;
