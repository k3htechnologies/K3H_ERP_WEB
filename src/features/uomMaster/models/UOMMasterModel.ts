import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationUomMaster {
    PageSize: number
    PageNumber: number
    IsCheckPermission?:boolean
    UomName?: string
    UomMasterId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface UomMasterData {
    UomMasterId: number,
    UniqueKey: string,

    UomCode: string,
    Uom: string,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateUomMasterRequest {
    UomMasterId: number | 0,
    Uniquekey: string | null

    UomCode: string,
    UomName: string,
}

export interface DeleteUomMasterRequest {
    UomMasterId: number,
    Uniquekey: string,
}

export type UomMasterListResponse = ApiResponse<UomMasterData[]>;
export type UomMasterSaveReponse = ApiResponse<UomMasterData[]>;
export type UomMasterDeleteResponse = ApiResponse<number>;
