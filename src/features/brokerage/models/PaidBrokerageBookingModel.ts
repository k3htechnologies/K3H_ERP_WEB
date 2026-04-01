import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaidBrokerageBookingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BookingId?: number
    BrokerageInvoiceId?: number
    PaidBrokerageBookingId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PaidBrokerageBookingData {
    ProjectId: number | 0
    Uniquekey: string | null
    BookingId: number | 0
    PaidBrokerageBookingId: number | 0
    BrokerageInvoiceId: number | 0
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
    BankListMasterId: number | 0
    PaymentType: string | ''
    AmountPaid: number | 0
    TDSAmount: number | 0
    TransactionNumber: string | null
    BankName: string | null
    TransactionReceiptURL: string | ''
    RemoveTransactionReceiptURL: string | ''
}

export interface DeletePaidBrokerageBookingRequest {
    PaidBrokerageBookingId: number
    BookingId: number
    BrokerageInvoiceId: number
    Uniquekey: string
    ProjectId: number
}

export type PaidBrokerageBookingListResponse = ApiResponse<PaidBrokerageBookingData[]>;
export type PaidBrokerageBookingSaveResponse = ApiResponse<PaidBrokerageBookingData[]>
export type PaidBrokerageBookingDeleteResponse = ApiResponse<number[]>