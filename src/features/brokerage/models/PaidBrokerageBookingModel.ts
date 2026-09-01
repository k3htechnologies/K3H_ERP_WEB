import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaidBrokerageBookingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BookingId?: number
    BrokerageInvoiceId?: number
    PaidBrokerageBookingId?: number
    InvoiceNumber?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PaidBrokerageBookingData {
    ProjectId: number | 0
    Uniquekey: string | null
    BookingId: number | 0
    PaidBrokerageBookingId: number | 0
    BrokerageInvoiceId: number | 0
    InvoiceNumber: string | ''
    InvoiceAmount: number | 0
    PaymentMode: string | null
    ProjectBankListMasterId: number;
    ProjectBankName: string;
    ProjectAccountNumber: string;
    ProjectIFSCCode: string;
    ProjectNatureOfAccount: string;
    ProjectAcType: string;
    PaymentType: string | null
    AmountPaid: number | 0
    AccountNumber: string | null
    IFSCCode: string | null
    OutstandingAmount: string | null
    TDSAmount: number | 0
    TransactionNumber: string | null
    TransactionReceiptURL: string | null
    TransactionChequeDemandDraftDate: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdatePaidBrokerageBookingRequest {
    ProjectId: number | 0
    Uniquekey: string | null
    BookingId: number | 0
    PaidBrokerageBookingId: number | 0
    BrokerageInvoiceId: number | 0
    PaymentMode: string | ''
    ProjectBankListMasterId: number | 0
    PaymentType: string | ''
    AmountPaid: number | 0
    TDSAmount: number | 0
    TransactionNumber: string | null
    ProjectBankName: string | null
    TransactionReceiptURL: string | ''
    RemoveTransactionReceiptURL: string | ''
    TransactionChequeDemandDraftDate: string | null
}

export interface DeletePaidBrokerageBookingRequest {
    PaidBrokerageBookingId: number
    Uniquekey: string
    BookingId: number
    ProjectId: number
    BrokerageInvoiceId: number
}

export type PaidBrokerageBookingListResponse = ApiResponse<PaidBrokerageBookingData[]>;
export type PaidBrokerageBookingSaveResponse = ApiResponse<PaidBrokerageBookingData[]>
export type PaidBrokerageBookingDeleteResponse = ApiResponse<number[]>