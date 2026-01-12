import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEarningMasterRequest {
    PageSize: number
    PageNumber: number
    EarningMasterId?: number
    Name?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface EarningMasterData {
    EarningMasterId: number | 0
    Uniquekey: string | null
    Name: string | ''
    Type: string | ''
    Value: number | 0
    MinSalary: number | 0
    MaxSalary: number | 0
    BranchMasterId: number | 0
    BranchName: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateEarningMasterRequest {
    EarningMasterId: number | 0
    Uniquekey: string | null
    Name: string | ''
    Type: string | ''
    Value: number | 0
    MinSalary: number | 0
    MaxSalary: number | 0
    BranchMasterId: number | 0
}

export interface DeleteEarningMasterRequest {
    EarningMasterId: number
    UniqueKey: string
}

export type EarningMasterListResponse = ApiResponse<EarningMasterData[]>;
export type EarningMasterSaveResponse = ApiResponse<EarningMasterData[]>;
export type EarningMasterDeleteResponse = ApiResponse<number>;
