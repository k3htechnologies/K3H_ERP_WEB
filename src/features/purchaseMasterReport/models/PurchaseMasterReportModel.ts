import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPurchaseMasterReport {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ProjectName?: string | null
    MaterialRequisitionId?: number | 0
    SystemGeneratedCode?: string | null
    FromDate?: string | null
    ToDate?: string | null
    VendorName?: string | null
    MaterialName?: string;
    SubMaterialName?: string;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface PurchaseMasterReportData {

    MaterialRequisitionId: number;
    SystemGeneratedCode: string;

    ProjectId: number;
    ProjectName: string;

    FinalVendor: string;

    PurchaseOrderURL: string;

    PurchaseCreatedDate: string | null;

    MaterialName: string;
    MaterialCode: string;
    SubMaterialName: string;

    UomCode: string;
    Uom: string;

    RequiredDate: string | null;

    MaterialQuantity: number;
    MaterialReceivedQuantityTillDate: number;
    Amount: number;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
}



export type PurchaseMasterReportListResponse = ApiResponse<PurchaseMasterReportData[]>;