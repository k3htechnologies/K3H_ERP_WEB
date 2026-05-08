import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisition {
    PageSize: number
    PageNumber: number
    ProjectId: number
    MaterialRequisitionId?: number | 0
    SystemGeneratedCode?: string | null
    FromDate?: string | null
    ToDate?: string | null
    MaterialRequisitionStage?: string | null
    MaterialRequisitionStatus?: string | null
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface MaterialRequisitionData {
    MaterialRequisitionId: number;
    Uniquekey: string;
    SystemGeneratedCode: string;
    ProjectId: number;
    ProjectName: string;
    AttachmentsURL: string;
    Remarks: string;
    ClientRegistrationId: number;
    MaterialRequisitionStage: string;
    MaterialRequisitionStatus: string;
    FinalVendor: string;
    IsSplit: boolean;
    IsCopy: boolean;
    IsRequisitionAction: boolean;
    IsApprovalVendorFinalization: boolean;
    IsApprovalInvoice: boolean;
    VendorFinalizationApprovalStatus: string;
    InvoiceApprovalStatus: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
    PaidAmount: number;
    TotalPoAmount: number;
    TotalInvoiceAmount: number;
    TotalInvoice: number;
    PurchaseOrderURL: string;
    MaterialRequisitionDetailData: MaterialRequisitionDetailData[];
    VendorName: string | null
    CompanyName: string | null
    ExpectedDeliveryInDays: number | 0
    MaterialRequisitionInvoiceData: MaterialRequisitionInvoiceData[];
}

export interface AddUpdateMaterialRequisitionDetailRequest {
    // MaterialRequisitionDetailId:number;
    // Uniquekey:string;
    MaterialMasterId: number;
    // MaterialCode:string;
    MaterialName: string;
    SubMaterialName: string;
    SubMaterialMasterId: number;
    MaterialQuantity: number;
    UomMasterId: number;
    UomCode: string;
    RequiredDate: string | null;
    Remark: string ;
}

export interface MaterialRequisitionDetailData {
    MaterialRequisitionDetailId: number;
    Uniquekey: string;
    MaterialMasterId: number;
    MaterialCode: string;
    MaterialName: string;
    SubMaterialName: string;
    SubMaterialMasterId: number;
    MaterialQuantity: number;
    UomMasterId: number;
    UomCode: string;
    Uom: string;
    RequiredDate: string;
    MaterialReceivedQuantityTillDate: number;
    Remark: string | null
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: Date;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: null;
}

export interface MaterialRequisitionInvoiceData {
    InvoiceNumber: string | null;
    InvoiceAmount: number | 0;
    InvoiceDueDate: string
}

export interface AddUpdateMaterialRequisitionRequest {
    MaterialRequisitionId: number;
    Uniquekey: string;
    IsCopy: boolean;
    ProjectId: number;
    Remarks: string;
    IsSplit: boolean;
    AttachmentsURL: string | null;
    RemoveAttachmentsURL: string | null;
    MaterialRequisitionDetailJSON: string;
}

//used in delete and close both as the payload is same
export interface DeleteMaterialRequisitionRequest {
    MaterialRequisitionId: number,
    Uniquekey: string | null,
    ProjectId: number | 0,
}


export type MaterialRequisitionListResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionSaveReponse = ApiResponse<MaterialRequisitionData>;
export type MaterialRequisitionDeleteResponse = ApiResponse<number>;