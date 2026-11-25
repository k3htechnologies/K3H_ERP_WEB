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
    MaterialRequisitionStatus?: string | null
    MaterialRequisitionType?: string | null
    CompanyName?: string | null
    Department?: string | null
    ApprovalStatus?: string | null
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface FilterMaterialRequisitionOverview {
    ProjectId: number
    MaterialRequisitionId?: number | 0
    ExportType?: "PDF" | "Excel" | "MATERIAL REQUISITION PDF"
}
export interface FilterMaterialRequisitionDetails {
    ProjectId: number
    MaterialRequisitionId?: number | 0
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
    MaterialRequisitionStatus: string;
    CloseCompletionRemark: string;
    IsSplit: boolean;
    IsCopy: boolean;
    IsRequisitionAction: boolean;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    Department: string;
    DepartmentMasterId: number;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
    MaterialRequisitionDetailData: MaterialRequisitionDetailData[];
    MaterialRequisitionInvoiceData: MaterialRequisitionInvoiceData[];
    CompanyName: string | null
    CompanyGSTNumber: string | null
    CompanyPANNumber: string | null
    IsApproval: boolean;
    ApprovalStatus: string | null;
    PaidAmount: number;
    TDSPaidAmount: number;
    TotalPoAmount: number;
    TotalInvoiceAmount: number;
    TotalInvoice: number;
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

    ApprovalStatus: string;
    VendorSystemGeneratedCode: string;
    VendorCompanyName: string;
    VendorName: string;
    VendorId: number;
    Amount: number;
    PurchaseOrderURL: string;
    POSystemGeneratedCode: string;
    MaterialRequisitionPurchaseOrderId:number
    PurchaseOrderCreatedBy: Date;
    PurchaseOrderCreatedDate: Date;
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

export interface CloseMaterialRequisitionRequest {
    MaterialRequisitionId: number,
    Uniquekey: string | null,
    ProjectId: number | 0,
    Type: string | null,
    CloseCompletionRemark: string | null,
}

export type MaterialRequisitionListResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionOverviewResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionDetailsResponse = ApiResponse<MaterialRequisitionData[]>;
export type MaterialRequisitionSaveReponse = ApiResponse<MaterialRequisitionData>;
export type MaterialRequisitionDeleteResponse = ApiResponse<number>;
export type MaterialRequisitionCloseResponse = ApiResponse<number>;