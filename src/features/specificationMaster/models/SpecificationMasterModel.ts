import type { ApiResponse } from "@/core/api/ApiResponse"

export interface filterwithPaginationSpecificationMasterRequest {
    PageSize: number
    PageNumber: number
    SpecificationMasterId?: number
    LevelType?: string
    CategoryName?: string
    IsCheckPermission?: boolean
    IsExpandChild?: boolean
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface SpecificationMasterData {
    SpecificationMasterId: number | 0
    UniqueKey: string | null
    CategoryName: string | null
    UomMasterId: number | 0
    Uom: string | null
    LevelType: string | null
    Level1Name: string | null
    Level2Name: string | null
    Level3Name: string | null
    Level4Name: string | null
    LevelId1: number | 0
    LevelId2: number | 0
    LevelId3: number | 0
    LevelId4: number | 0
    OrderBy: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateSpecificationMaster {
    SpecificationMasterId: number | 0
    Uniquekey: string | null
    CategoryName: string | null
    UomMasterId: number | 0
    LevelId1: number | 0,
    LevelId2: number | 0,
    LevelId3: number | 0,
    LevelId4: number | 0,
    OrderBy: number | 0,
}

export interface DeleteSpecificationMasterRequest {
    SpecificationMasterId: number | 0
    UniqueKey: string | null
}

export type SpecificationMasterListResponse = ApiResponse<SpecificationMasterData[]>;
export type SpecificationMasterSaveResponse = ApiResponse<SpecificationMasterData[]>;
export type DeleteSpecificationMasterResponse = ApiResponse<number[]>