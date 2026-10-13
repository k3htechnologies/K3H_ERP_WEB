import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBaselineCostPlanDocument {
    PageSize: number
    PageNumber: number
    ProjectId: number
    BaselineCostPlanDocumentId: number
    BaselineCostPlanDocumentName?: string
    BaselineCostPlanDocumentCategory?: string
    BaselineCostPlanDocumentCategoryId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BaselineCostPlanDocumentData {
    BaselineCostPlanDocumentId: number;
    Uniquekey: string;
    ProjectId: number;
    BaselineCostPlanDocumentName: string;
    BaselineCostPlanDocumentCategoryId: number;
    BaselineCostPlanDocumentCategory: string;
    BaselineCostPlanValue: number | null;
    BaselineCostPlanDocumentRemark: string;
    BaselineCostPlanDocumentURL: string;
    BaselineCostPlanDocumentApprovalStatus: string;
    IsApproval: boolean;
    UploadedDocumentCount: number;
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

export interface AddUpdateBaselineCostPlanDocumentRequest {
    BaselineCostPlanDocumentId?: number | 0;
    Uniquekey?: string | '';
    ProjectId?: number | '';
    BaselineCostPlanDocumentCategoryId?: number | 0;
    BaselineCostPlanDocumentName?: string | '';
    BaselineCostPlanValue?: number | null;
    IsMaster?: number | 0;
    BaselineCostPlanDocumentURL?: File[] | null; 
    RemoveBaselineCostPlanDocumentURL?: string| '';
    BaselineCostPlanDocumentRemark?: string | '';
}

export interface DeleteBaselineCostPlanDocumentRequest {
    BaselineCostPlanDocumentId: number,
    projectId: number;
    Uniquekey: string,
    BaselineCostPlanDocumentCategoryId: number;
}

export type BaselineCostPlanDocumentListResponse = ApiResponse<BaselineCostPlanDocumentData[]>;
export type BaselineCostPlanDocumentSaveReponse = ApiResponse<BaselineCostPlanDocumentData[]>;
export type BaselineCostPlanDocumentDeleteResponse = ApiResponse<number>;
