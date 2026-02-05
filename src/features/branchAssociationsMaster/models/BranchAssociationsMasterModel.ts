import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBranchAssociationsMasterRequest {
    PageSize: number
    PageNumber: number
    BranchAssociationsId?: number
    IsCheckPermission?: boolean
    EmployeeName?: string
    BranchMasterId?: string
    EmployeeId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BranchAssociationsMasterData {
    BranchAssociationsId: number | null
    Uniquekey: string | null
    BranchName: string | null
    BranchMasterId: string | null
    EmployeeId: number | null
    EmployeeName: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateBranchAssociationsMasterRequest {
    BranchAssociationsId: number | null
    Uniquekey: string | null
    BranchMasterId: string | null
    EmployeeId: number | null
}

export interface DeleteBranchAssociationsRequest {
    BranchAssociationsId: number
    UniqueKey: string
}


export type BranchAssociationsMasterListResponse = ApiResponse<BranchAssociationsMasterData[]>;
export type BranchAssociationsMasterSaveResponse = ApiResponse<BranchAssociationsMasterData[]>;
export type BranchAssociationsDeleteResponse = ApiResponse<number>;
