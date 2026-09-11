import type { ApiResponse } from "@/core/api/ApiResponse"
import type { MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel"

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
    VendorName?: string | null
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface FilterMaterialRequisitionOverview {
    ProjectId: number
    MaterialRequisitionId?: number | 0
    ExportType?: "PDF" | "Excel"
}
export interface FilterMaterialRequisitionDetails {
    ProjectId: number
    MaterialRequisitionId?: number | 0
    ExportType?: "PDF" | "Excel"
}

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
    VendorName?: string | null
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
    FinalVendorCompanyName: string;
    FinalVendorMobileNumber: string;
    FinalVendorGSTNumber: string;
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
    TotalTaxAmount: number;
    PurchaseOrderURL: string;
    MaterialRequisitionDetailData: MaterialRequisitionDetailData[];
    MaterialRequisitionInvoiceData: MaterialRequisitionInvoiceData[];
    VendorName: string | null
    CompanyName: string | null
    ExpectedDeliveryInDays: number | 0
    ExpectedPaymentInDays: number | 0
}

export interface MaterialRequisitionDetailData {
    MaterialRequisitionDetailId: number;
    Uniquekey: string;
    MaterialMasterId: number;
    MaterialCode: string;
    MaterialName: string;
    SubMaterialName: string;
    SubMaterialMasterId: number;
    UomMasterId: number;
    UomCode: string;
    Uom: string;
    LevelId1: number,
    Level1Name: string | null
    LevelId2: number,
    Level2Name: string | null
    LevelId3: number,
    Level3Name: string | null
    LevelId4: number,
    Level4Name: string | null
    Level4SubMaterialUomCode: string | null
    Level4SubMaterialUom: string | null
    MaterialQuantity: number;
    RequiredDate: string;
    MaterialReceivedQuantityTillDate: number;
    MaterialRequisitionType: string | null;
    Remark: string | null
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: Date;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: null;
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

export interface AddUpdateMaterialRequisitionDetailRequest {
    MaterialRequisitionDetailId: number;
    MaterialMasterId: number;
    MaterialName: string;
    SubMaterialName: string;
    SubMaterialMasterId: number;
    UomMasterId: number;
    UomCode: string;
    LevelId1: number,
    Level1Name: string | null
    LevelId2: number,
    Level2Name: string | null
    LevelId3: number,
    Level3Name: string | null
    LevelId4: number,
    Level4Name: string | null
    Level4SubMaterialUomCode: string | null
    Level4SubMaterialUom: string | null
    MaterialQuantity: number;
    RequiredDate: string | null;
    MaterialRequisitionType: string;
    Remark: string;
}

export interface DeleteMaterialRequisitionRequest {
    MaterialRequisitionId: number,
    Uniquekey: string | null,
    ProjectId: number | 0,
}

export type MaterialRequisitionListResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionOverviewResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionDetailsResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionSaveReponse = ApiResponse<MaterialRequisitionData>;
export type MaterialRequisitionDeleteResponse = ApiResponse<number>;