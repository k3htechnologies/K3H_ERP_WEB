import type { ApiResponse } from "../../../core/api/ApiResponse"

export interface FilterWithPaginationDepartmentMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    DepartmentMasterId?: number
    DepartmentName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DepartmentMasterData {
    DepartmentMasterId: number | 0
    Uniquekey: string | ''
    DepartmentCode: string | ''
    DepartmentName: string | ''
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

export interface AddUpdateDepartmentMasterRequest {
    DepartmentMasterId?: number
    Uniquekey?: string
    DepartmentCode: string
    DepartmentName: string
}

export interface DeleteDepartmentMasterRequest {
    DepartmentMasterId: number
    UniqueKey: string
}

export type DepartmentMasterListResponse = ApiResponse<DepartmentMasterData[]>;
export type DepartmentMasterSaveResponse = ApiResponse<DepartmentMasterData[]>;
export type DepartmentMasterDeleteResponse = ApiResponse<number>;
