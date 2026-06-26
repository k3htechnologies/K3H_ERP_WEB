import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentLedgerCrm {
    ProjectId?: number;
    BookingId?: number;
    ExportType?: 'Excel' | 'PDF';
}

export interface PaymentLedgerCrmModelData {
    PayTrackPaymentLedgerId: number;
    Uniquekey?: string;
    BookingId: number;
    ProjectId: number;
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
    ProjectNatureOfAccount: string;
    ProjectAcType: string;

    ReceivedAmount: number;
    TransactionChequeDemandDraftNumber: string;
    TransactionChequeDemandDraftURL: string;
    TransactionChequeDemandDraftDate: string;
    IsBookingAmount: boolean;

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

export interface AddUpdatePaymentLedgerCrm {
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
    TransactionChequeDemandDraftURL? : File[] | null; 
    RemoveTransactionChequeDemandDraftURL: string;
    TransactionChequeDemandDraftDate: string;
    
}

export interface DeletePaymentLedgerCrmRequest {
    PayTrackPaymentLedgerId: number;
    Uniquekey: string,
    ProjectId: number;
}

export type PaymentLedgerCrmListResponse = ApiResponse<PaymentLedgerCrmModelData[]>;
export type PaymentLedgerCrmSaveResponse = ApiResponse<PaymentLedgerCrmModelData[]>;
export type PaymentLedgerCrmDeleteResponse = ApiResponse<number>;
