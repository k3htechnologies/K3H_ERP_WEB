import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationContractRequisitionWorkOrder {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ContractRequisitionId?: number
    Uniquekey?: string
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ContractRequisitionWorkOrderData {
    ContractRequisitionWorkOrderId: number | 0;
    UniqueKey: string | null;
    ContractRequisitionId: number | 0;
    ContractRequisitionWorkOrderURL: string | null;
    ClientRegistrationId: number;
    TotalAmount: number;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateContractRequisitionWorkOrderRequest {
    ContractRequisitionWorkOrderId: number | 0;
    UniqueKey: string;
    ContractRequisitionId: number | 0;
    TotalAmount: number;
    ContractRequisitionWorkOrderURL: string | null;
    RemoveContractRequisitionWorkOrderURL: string | '';
    ProjectId: number | 0;
}

export interface DeleteContractRequisitionWorkOrder {
    ContractRequisitionWorkOrderId: number | 0;
    Uniquekey: string | null;
    ContractRequisitionId: number | 0;
    ProjectId: number | 0;
}

export interface GenerateContractRequisitionWorkOrderPdfData {
    ContractRequisitionId: number | 0;
    ProjectId: number | 0;
    Uniquekey: string | null;
    Remarks: string | null;
    TermsCondition: string | null;
}

export type ContractRequisitionWorkOrderListResponse = ApiResponse<ContractRequisitionWorkOrderData[]>;
export type ContractRequisitionWorkOrderSaveResponse = ApiResponse<ContractRequisitionWorkOrderData>;
export type ContractRequisitionWorkOrderDeleteResponse = ApiResponse<number>;
export type GenerateContractRequisitionWorkOrderPdfSaveResponse = ApiResponse<GenerateContractRequisitionWorkOrderPdfData[]>;