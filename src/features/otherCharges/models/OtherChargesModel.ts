import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationOtherChargesRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ProjectId?: number
    ChargeName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface OtherChargesData {
    OtherChargesId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    ChargeName: string | null
    CalculatedOn: string | null
    Value: number | 0
    GSTPercentage: number | 0
    GSTValue: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateOtherChargesRequest {
    OtherChargesId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    ChargeName: string | null
    CalculatedOn: string | null
    Value: number | 0
    GSTPercentage: number | 0
    GSTValue: number | 0
}

export interface DeleteOtherChargesRequest {
    OtherChargesId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type OtherChargesListResponse = ApiResponse<OtherChargesData[]>;
export type OtherChargesSaveResponse = ApiResponse<OtherChargesData[]>;
export type OtherChargesDeleteResponse = ApiResponse<number[]>;