import type { ApiResponse } from "@/core/api/ApiResponse";

export interface ContractRequisitionQuotationDetailsTermsData {
    ContractRequisitionQuotationTermsId: number;
    Uniquekey: string;
    ContractRequisitionId: number;
    VendorId: number;
    ExpectedDeliveryInDays: number;
    ExpectedPaymentInDays: number;
    Total: number;
    QuotationURL: string | null
    ContractRequisitionQuotationData: ContractRequisitionQuotationDetailsData[];
    SystemGeneratedCode: string;
    ProjectName: string;
    CompanyName: string;
    VendorName: string;
    MobileNumber: string;
    EmailId: string;
}

export interface ContractRequisitionQuotationDetailsData {
    ContractRequisitionQuotationId: number;
    Uniquekey: string;
    ContractRequisitionQuotationTermsId: number;
    ContractRequisitionDetailId: number;
    ContractCode: string;
    ContractName: string;
    SubContractName: string;
    UomCode: string;
    Uom: string;
    ContractQuantity: number;
    ContractPerUnit: number;
    Logistics: string;
    Amount: number;
    Installation: number;
    CGST: number;
    SGST: number;
    UGST: number;
    TGST: number;
}

export interface FilterWithContractRequisitionQuotationRequest {
    ContractRequisitionId: number;
    UniqueKey: string;
    VendorId: number;
    ProjectId: number;
}

export interface AddUpdateContractRequestQuotation {
    ContractRequisitionQuotationTermsId: number;
    ProjectId: number;
    UniqueKey: string;
    ContractRequisitionId: number;
    VendorId: number;
    ExpectedCompletionInDays: number;
    ExpectedPaymentInDays: number;
    Total: number;
    QuotationURL?: (File | string)[] | null;
    RemoveQuotationURL?: string | '';
    ContractRequisitionQuotationJSON: string;
    MagicLinkUniqueKey?: string;
    ClientRegistrationId?: number;
}

export interface DeleteContractRequisitionQuotation {
    ContractRequisitionQuotationTermsId: number;
    UniqueKey: string;
    ContractRequisitionId: number;
    ProjectId: number;
}

export interface FilterWithContractRequisitionSummaryOfQuotationRequest {
    ContractRequisitionId?: number | 0
    ProjectId: number | 0
}

export interface ContractRequisitionSummaryOfQuotationData {
    VendorName: string;
    CompanyName: string;
    ExpectedDeliveryInDays: number;
    ExpectedPaymentInDays: number;
    Total: number;
    QuotationURL: string | null
    QuotationType: string;
    QuotationLevel: string;
}

export type ContractRequisitionQuotationListResponse = ApiResponse<ContractRequisitionQuotationDetailsTermsData[]>;
export type ContractRequisitionQuotationSaveReponse = ApiResponse<ContractRequisitionQuotationDetailsTermsData>;
export type DeletContractRequisitionDeleteResponse = ApiResponse<number>;
export type ContractRequisitionSummaryOfQuotationListResponse = ApiResponse<ContractRequisitionSummaryOfQuotationData[]>;