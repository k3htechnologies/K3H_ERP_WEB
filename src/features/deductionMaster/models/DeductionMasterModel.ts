import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationDeductionMasterRequest {
    PageSize: number
    PageNumber: number
    DeductionMasterId?: number
    Name?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DeductionMasterData {
    DeductionMasterId: number | 0
    Uniquekey: string | null

    Name: string | ''
    Type: string | ''
    Value: number | 0

    Applicable: string | ''

    BranchMasterId: number | 0
    BranchName: string | ''

    MinSalary: number | 0
    MaxSalary: number | 0

    Gender: string | ''

    StateMasterId: number | 0
    StateName: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateDeductionMasterRequest {
    DeductionMasterId: number | 0
    Uniquekey: string | null

    Name: string | ''
    Type: string | ''
    Value: number | 0
    Applicable: string | ''

    BranchMasterId: number | 0
    BranchName: string | ''

    MinSalary: number | 0
    MaxSalary: number | 0

    Gender?: string | ''

    StateMasterId: number | 0
    StateName: string | ''
}

export interface DeleteDeductionMasterRequest {
    DeductionMasterId: number
    UniqueKey: string
}

export type DeductionMasterListResponse = ApiResponse<DeductionMasterData[]>;
export type DeductionMasterSaveResponse = ApiResponse<DeductionMasterData[]>;
export type DeductionMasterDeleteResponse = ApiResponse<number>;
