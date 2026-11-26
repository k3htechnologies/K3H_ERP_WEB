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

export type ContractMasterListResponse = ApiResponse<ContractMasterData[]>;
