import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisitionInvoice {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    Uniquekey?: string
    MaterialRequisitionId?: number
    MaterialRequisitionInvoiceId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface MaterialRequisitionInvoiceData {
    MaterialRequisitionInvoiceId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionId: number | 0;
    InvoiceNumber: string | null;
    InvoiceDate: string | null;
    UploadInvoiceURL: string | null;
    RemoveUploadInvoiceURL: string | null;
    PerformaInvoiceURL: string | null;
    RemovePerformaInvoiceURL: string | null;
    MeasurementInvoiceURL: string | null;
    RemoveMeasurementInvoiceURL: string | null;
    InvoiceAmount: number | 0;
    InvoiceAmountPaidTillDate: number | 0;
    InvoiceDueDate: string | null;
    Remarks: string | null;
    InvoiceStatus: string
    IsApproval: boolean
}

export interface AddUpdateMaterialRequisitionInvoice {
    MaterialRequisitionInvoiceId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionId: number | 0;
    InvoiceNumber: string | null;
    InvoiceDate: string | null;
    UploadInvoiceURL: string | null;
    RemoveUploadInvoiceURL: string | null;
    PerformaInvoiceURL: string | null;
    RemovePerformaInvoiceURL: string | null;
    MeasurementInvoiceURL: string | null;
    RemoveMeasurementInvoiceURL: string | null;
    InvoiceAmount: number | 0;
    InvoiceDueDate: string | null;
    Remarks: string | null;
}

export interface DeleteMaterialRequisitionInvoice {
    MaterialRequisitionInvoiceId: number | 0;
    Uniquekey: string | null;
    MaterialRequisitionId: number | 0;
    ProjectId: number | 0;
}

export type MaterialRequisitionInvoiceListResponse = ApiResponse<MaterialRequisitionInvoiceData[]>;
export type MaterialRequisitionInvoiceSaveResponse = ApiResponse<MaterialRequisitionInvoiceData>;
export type MaterialRequisitionInvoiceDeleteResponse = ApiResponse<number>;