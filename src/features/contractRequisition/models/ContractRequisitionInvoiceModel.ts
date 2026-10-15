import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationContractRequisitionInvoice {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ContractRequisitionId?: number
    UniqueKey?: string
    ContractRequisitionInvoiceId?: number
    ContractRequisitionWorkOrderId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ContractRequisitionInvoiceData {
    ProjectId: number | 0;
    ContractRequisitionId: number | 0;
    ContractRequisitionInvoiceId: number | 0;
    UniqueKey: string | null;
    ContractRequisitionWorkOrderId : number | 0;
    InvoiceNumber: string | null;
    InvoiceDate: string | null;
    UploadInvoiceURL: string | null;
    PhotoURL: string | null;
    CertificateURL: string | null;
    InvoiceAmount: number | 0;
    InvoiceAmountPaidTillDate: number | 0;
    InvoiceTDSPaidTillDate: number | 0;
    InvoiceDueDate: string | null;
    PaymentAmount: string | null;
    PendingAmount: string | null;
    Remarks: string | null;
    InvoiceStatus: string;
    IsApproval: boolean
    ApprovalStatus?: string | null;
    CreatedById?: number | 0,
    CreatedBy?: string | '',
    CreatedDate?: string | null,
    ModifiedById?: number | 0,
    ModifiedBy?: string | '',
    ModifiedDate?: string | null,
}

export interface AddUpdateContractRequisitionInvoiceRequest {
    ProjectId: number | 0
    ContractRequisitionId: number | 0;
    ContractRequisitionInvoiceId: number | 0
    UniqueKey: string | null
    InvoiceNumber: string | 0
    InvoiceDate: string | ''
    UploadInvoiceURL: string | null
    RemoveUploadInvoiceURL: string | ''
    InvoiceAmount: number | 0
    InvoiceDueDate: string | ''
    Remarks: string | ''
    PhotoURL: string | null;
    RemovePhotoURL: string | null;
    CertificateURL: string | null;
    RemoveCertificateURL: string | null;
}

export interface DeleteContractRequisitionInvoice {
    ProjectId: number | 0;
    ContractRequisitionId: number | 0;
    ContractRequisitionInvoiceId: number | 0;
    UniqueKey: string | null;
}

export interface FilterWithPaginationContractRequisitionInvoiceSummary {
    ContractRequisitionId?: number
}

export interface ContractRequisitionInvoiceSummaryData {
    ContractRequisitionId: number | 0;
    TotalInvoiceAmount: number | 0,
    TotalAmountPaid: number | 0,
    TotalTDSAmountPaid: number | 0;
    RemainingInvoiceAmount: number | 0,
    TotalRequisitionAmount: number | 0,
    PaidRequisitionAmount: number | 0,
    PendingRequisitionAmount: number | 0
}

export type ContractRequisitionInvoiceListResponse = ApiResponse<ContractRequisitionInvoiceData[]>;
export type ContractRequisitionInvoiceSaveResponse = ApiResponse<ContractRequisitionInvoiceData>;
export type ContractRequisitionInvoiceDeleteResponse = ApiResponse<number>;
export type ContractRequisitionInvoiceSummaryListResponse = ApiResponse<ContractRequisitionInvoiceSummaryData[]>;