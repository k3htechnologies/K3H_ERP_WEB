import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentLedger {
    ProjectId?: number;
    BookingId?: number;
    PaymentFor?: string;
    ExportType?: 'Excel' | 'PDF';
}

export interface PaymentLedgerData {
    BookingId: number | null;
    ProjectId: number | null;
    PaymentFor?: string;
    TotalAmount: number;
    ReceivedAmount: number;
    UploadedPaymentLedgerCount: number;
    ApprovalPendingPaymentLedgerCount: number;
    OrderBy: number;
}

export interface PaymentLedgerSummaryModelData {
    PayTrackPaymentLedgerId: number;
    Uniquekey?: string;
    BookingId: number;
    ProjectId: number;

    ApplicantName: string;
    Wing: string;
    Flat: string;
    BookingOtherChargesId: number;

    ChargeName: string;
    PaymentFor: string;
    PaymentMode: string;
    PaymentReceivedFrom: string;

    BankListMasterId: number;
    BankName: string;

    ProjectBankListMasterId: number;
    ProjectBankName: string;
    ProjectAccountNumber: string;
    ProjectIFSCCode: string;

    ReceivedAmount: number;
    TransactionChequeDemandDraftNumber: string;
    TransactionChequeDemandDraftURL: string;
    TransactionChequeDemandDraftDate: string;

    ApprovalStatus: string;
    IsApproval: boolean;
    PaymentReceiptURL: string;
    CreatedById: string;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
}

export interface AddUpdatePaymentLedger {
    PayTrackPaymentLedgerId: number;
    Uniquekey: string;
    BookingId: number | null;
    ProjectId: number | null;
    BookingOtherChargesId: number | null;
    PaymentFor: string;
    PaymentMode: string;
    PaymentReceivedFrom: string;
    ProjectBankListMasterId: number;
    BankListMasterId: number;
    ReceivedAmount: number;
    TransactionChequeDemandDraftNumber: string;
    TransactionChequeDemandDraftURL?: File[] | null;
    RemoveTransactionChequeDemandDraftURL: string;
    TransactionChequeDemandDraftDate: string;

}

export interface DeletePaymentLedgerRequest {
    PayTrackPaymentLedgerId: number;
    Uniquekey: string,
    ProjectId: number;
}

export type PaymentLedgerListResponse = ApiResponse<PaymentLedgerData[]>;
export type PaymentLedgerSummaryListResponse = ApiResponse<PaymentLedgerSummaryModelData[]>;
export type PaymentLedgerSaveResponse = ApiResponse<PaymentLedgerSummaryModelData[]>;
export type PaymentLedgerDeleteResponse = ApiResponse<number>;
