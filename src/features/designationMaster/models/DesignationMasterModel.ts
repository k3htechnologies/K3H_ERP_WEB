import type { ApiResponse } from "../../../core/api/ApiResponse"

export interface FilterWithPaginationDesignationMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    DesignationMasterId?: number
    DesignationName?: string | ''
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DesignationMasterData {
    DesignationMasterId: number | 0
    Uniquekey: string | ''
    DesignationName: string | ''
    NoticePeriod: number | 0
    NumberOfEmployee: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateDesignationMasterRequest {
    DesignationMasterId?: number
    Uniquekey?: string
    DesignationName:  string
    NoticePeriod: number
}

export interface DeleteDesignationMasterRequest {
    DesignationMasterId: number
    UniqueKey: string
}

export type DesignationMasterListResponse = ApiResponse<DesignationMasterData>;
export type DesignationMasterSaveResponse = ApiResponse<DesignationMasterData>;
export type DesignationMasterDeleteResponse = ApiResponse<number>;
