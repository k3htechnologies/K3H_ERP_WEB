import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisitionPayment {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MaterialRequisitionInvoiceId?: number
    MaterialRequisitionId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface MaterialRequisitionPaymentData {
    MaterialRequisitionPaymentId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionInvoiceId: number | 0;
    MaterialRequisitionId: number | 0;
    PaymentMode: string | null
    BankListMasterId: number | 0
    BankName: string | null
    PaymentType: string | null
    AmountPaid: number | 0
    AccountNumber: string | null
    IFSCCode: string | null
    OutstandingAmount: string | null
    TDSAmount: number | 0
    TransactionNumber: string | null
    TransactionReceiptURL: string | null
    RemoveTransactionReceiptURL: string | ''
    IsAdvance: boolean | false
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateMaterialRequisitionPayment {
    MaterialRequisitionPaymentId: number | 0;
    Uniquekey: string | null;
    ProjectId: number | 0;
    MaterialRequisitionInvoiceId: number | 0;
    MaterialRequisitionId: number | 0;
    PaymentMode: string | null
    BankListMasterId: number | 0
    BankName: string | null
    PaymentType: string | null
    AmountPaid: number | 0
    AccountNumber: string | null
    IFSCCode: string | null
    OutstandingAmount: string | null
    TDSAmount: number | 0
    TransactionNumber: string | null
    TransactionReceiptURL: string | null
    RemoveTransactionReceiptURL: string | ''
    IsAdvance: boolean | false
}

export interface DeleteMaterialRequisitionPayment {
    MaterialRequisitionPaymentId: number | 0;
    Uniquekey: string | null;
    MaterialRequisitionId: number | 0;
    ProjectId: number | 0;
}

export type MaterialRequisitionPaymentListResponse = ApiResponse<MaterialRequisitionPaymentData[]>;
export type MaterialRequisitionPaymentSaveResponse = ApiResponse<MaterialRequisitionPaymentData[]>;
export type MaterialRequisitionPaymentDeleteResponse = ApiResponse<number>;