import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationContractRequisitionInvoicePayment {
    PageNumber: number;
    PageSize: number;
    ProjectId?: number
    ContractRequisitionId?: number
    ContractRequisitionInvoiceId?: number
}

export interface AddUpdateContractRequisitionInvoicePaymentRequest {
    ProjectId: number | 0;
    ContractRequisitionPaymentId: number;
    UniqueKey: string | null;
    ContractRequisitionId: number;
    ContractRequisitionInvoiceId: number;
    PaymentMode: string;
    PaymentType: string;
    BankListMasterId: number;
    AccountNumber: string;
    IFSCCode: string;
    AmountPaid: number;
    TDSAmount: number;
    TransactionNumber: string;
    TransactionReceiptURL: string;
    RemoveTransactionReceiptURL: string;
    PendingAmount: number;
    IsAdvance: boolean;
    ProjectBankListMasterId: number;
}

export interface ContractRequisitionInvoicePaymentData {
    ProjectId: number | 0;
    ContractRequisitionId: number | 0;
    ContractRequisitionInvoiceId: number | 0;
    ContractRequisitionPaymentId: number | 0;
    UniqueKey: string | null;
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
    IsAdvance: boolean | false
    ProjectBankListMasterId: number;
    ProjectBankName: string;
    ProjectAccountNumber: string;
    ProjectIFSCCode: string;
    ProjectNatureOfAccount: string;
    ProjectAcType: string;
    ClientRegistrationId: number;
    CreatedById?: number | 0,
    CreatedBy?: string | '',
    CreatedDate?: string | null,
    ModifiedById?: number | 0,
    ModifiedBy?: string | '',
    ModifiedDate?: string | null,
}

export interface DeleteContractRequisitionInvoicePayment {
    ProjectId: number | 0;
    ContractRequisitionId: number | 0;
    ContractRequisitionPaymentId: number | 0;
    UniqueKey: string | null;
}

export type ContractRequisitionInvoicePaymentListResponse = ApiResponse<ContractRequisitionInvoicePaymentData[]>;
export type ContractRequisitionInvoicePaymentSaveResponse = ApiResponse<ContractRequisitionInvoicePaymentData>;
export type ContractRequisitionInvoicePaymentDeleteResponse = ApiResponse<number>;