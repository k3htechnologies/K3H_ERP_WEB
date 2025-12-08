import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationSubMaterialMaster {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    MaterialName?: string
    SubMaterialName?: string
    SubMaterialMasterId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface SubMaterialMasterData {
    SubMaterialMasterId: number,
    Uniquekey: string,

    MaterialMasterId: number | 0,
    MaterialCode: string | '',
    MaterialName: string | '',
    SubMaterialName: string,
    UomMasterId: number | 0,
    UomCode: string | 0,
    Uom: string | 0,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdateSubMaterialMasterRequest {
    SubMaterialMasterId: number | 0,
    Uniquekey: string | null
    MaterialMasterId: number | 0,
    SubMaterialName: string,
    UomMasterId: number | 0,
}

export interface DeleteSubMaterialMasterRequest {
    SubMaterialMasterId: number,
    Uniquekey: string,
}

export type SubMaterialMasterListResponse = ApiResponse<SubMaterialMasterData[]>;
export type SubMaterialMasterSaveReponse = ApiResponse<SubMaterialMasterData[]>;
export type SubMaterialMasterDeleteResponse = ApiResponse<number>;
