import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialMaster {
    PageSize : number
    PageNumber : number
    MaterialMasterId? : number
    MaterialName : string
    sortBy? : string
    exportType? : "PDF" | "Excel"
}

export interface MaterialMasterData {
    MaterialMasterId : number,
    Uniquekey : string,

    MaterialCode : string,
    MaterialName : string,

    CreatedById : number | 0,
    CreatedBy : string | '',
    CreatedDate : string | null,

    ModifiedById : number | 0,
    ModifiedBy : string | '',
    ModifiedDate : string | null,
}

export interface AddUpdateMaterialMasterRequest {
    MaterialMasterId : number | 0,
    Uniquekey : string | null

    MaterialCode : string,
    MaterialName : string,
}

export interface DeleteMaterialMasterRequest {
    MaterialMasterId : number,
    Uniquekey : string,
}

export type MaterialMasterListResponse = ApiResponse<MaterialMasterData[]>;
export type MaterialMasterSaveReponse = ApiResponse<MaterialMasterData[]>;
export type MaterialMasterDeleteResponse = ApiResponse<number>;
