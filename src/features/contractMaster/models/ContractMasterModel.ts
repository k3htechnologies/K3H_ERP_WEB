import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationContractMaster {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ContractMasterId?: number
    ContractName?: string
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface ContractMasterData {
    ContractMasterId: number,
    Uniquekey: string,

    ContractCode: string,
    ContractName: string,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateContractMasterRequest {
    ContractMasterId: number | 0,
    Uniquekey: string | null

    ContractCode: string,
    ContractName: string,
}

export interface DeleteContractMasterRequest {
    ContractMasterId: number,
    Uniquekey: string | null,
}

export type ContractMasterListResponse = ApiResponse<ContractMasterData[]>;
export type ContractMasterSaveReponse = ApiResponse<ContractMasterData[]>;
export type ContractMasterDeleteResponse = ApiResponse<number>;
