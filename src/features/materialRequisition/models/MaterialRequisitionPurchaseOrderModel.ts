import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisitionPurchaseOrder {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MaterialRequisitionId?: number
    Uniquekey?: string
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface MaterialRequisitionPurchaseOrderData {
    MaterialRequisitionPurchaseOrderId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionId: number | 0;
    PurchaseOrderURL: string | null;
    RemovePurchaseOrderURL: string | '';
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateMaterialRequisitionPurchaseOrder {
    MaterialRequisitionPurchaseOrderId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionId: number | 0;
    PurchaseOrderURL: string | null;
    RemovePurchaseOrderURL: string | '';
}

export interface DeleteMaterialRequisitionPurchaseOrder {
    MaterialRequisitionPurchaseOrderId: number | 0;
    Uniquekey: string | null;
    MaterialRequisitionId: number | 0;
    ProjectId: number | 0;
}

export interface GenerateMaterialRequisitionPurchaseOrderPdfData {
    MaterialRequisitionId: number | 0;
    ProjectId: number | 0;
    Uniquekey: string | null;
    Remarks: string | null;
    TermsCondition: string | null;
    
}

export type MaterialRequisitionPurchaseOrderListResponse = ApiResponse<MaterialRequisitionPurchaseOrderData[]>;
export type MaterialRequisitionPurchaseOrderSaveResponse = ApiResponse<MaterialRequisitionPurchaseOrderData>;
export type MaterialRequisitionPurchaseOrderDeleteResponse = ApiResponse<number>;
export type GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse = ApiResponse<GenerateMaterialRequisitionPurchaseOrderPdfData[]>;