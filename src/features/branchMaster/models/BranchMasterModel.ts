import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBranchMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    BranchMasterId?: number
    BranchName?: string
    BranchCode: string | ''
    Location: string | ''
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BranchMasterData {
    BranchMasterId: number | 0
    Uniquekey: string | null
    BranchCode: string | ''
    BranchName: string | ''
    IsHeadOffice: boolean | false
    Location: string | ''
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

export interface AddUpdateBranchMasterRequest {
    BranchMasterId: number | 0
    Uniquekey: string | null
    BranchCode: string | ''
    BranchName: string | ''
    IsHeadOffice: boolean | false
    Location: string | ''
}

export interface DeleteBranchMasterRequest {
    BranchMasterId: number
    UniqueKey: string
}

export type BranchMasterListResponse = ApiResponse<BranchMasterData[]>;
export type BranchMasterSaveResponse = ApiResponse<BranchMasterData[]>;
export type BranchMasterDeleteResponse = ApiResponse<number>;
