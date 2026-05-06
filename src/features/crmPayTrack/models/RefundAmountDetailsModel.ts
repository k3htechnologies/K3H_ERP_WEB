import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationRefundAmountDetails {
    BookingId: number;
    ProjectId: number;
    ExportType?: "PDF" | "Excel"
}

export interface RefundAmountDetailsData {
    RefundedAmountLedgerId: number;
    Uniquekey: string | null;
    BookingId: number;
    ProjectId: number;
    PaymentFor: string;
    PaymentMode: string;
    ProjectBankListMasterId: number;
    ProjectBankName: string | null;
    ProjectAccountNumber: string | null;
    ProjectIFSCCode: string | null;
    AccountHolderName: string | null;
    BankListMasterId: number;
    BankName: string | null;
    AccountNumber: string | null;
    IFSCCode: string | null;
    AmountType: string | null;
    PaymentType: string | null;
    RefundedAmount: number;
    TransactionChequeDemandDraftNumber: string | null;
    TransactionChequeDemandDraftURL: string | null;
    TransactionChequeDemandDraftDate: string | null;
    PaymentReceiptURL: string | null;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateRefundAmountDetailsRequest {
    RefundedAmountLedgerId?: number;
    Uniquekey?: string | null;
    BookingId: number | null;
    ProjectId: number | null;
    PaymentFor: string | null;
    PaymentMode: string | null;
    ProjectBankListMasterId: number;
    ProjectBankName: string | null;
    ProjectAccountNumber: string | null;
    ProjectIFSCCode: string | null;
    AccountHolderName: string | null;
    BankListMasterId: number;
    BankName: string | null;
    AccountNumber: string | null;
    IFSCCode: string | null;
    AmountType: string | null;
    RefundedAmount: number;
    TransactionChequeDemandDraftNumber: string | null;
    TransactionChequeDemandDraftURL: string | null;
    TransactionChequeDemandDraftDate: string | null;
    PaymentReceiptURL: string | null;

}

export interface DeleteRefundAmountDetailsRequest {
    RefundedAmountLedgerId: number;
    Uniquekey: string,
    ProjectId: number;
    BookingId: number;
}

export type RefundAmountDetailsListResponse = ApiResponse<RefundAmountDetailsData[]>;
export type RefundAmountDetailsSaveReponse = ApiResponse<RefundAmountDetailsData[]>;
export type RefundAmountDetailsDeleteResponse = ApiResponse<number>;


