import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationSaleTargetRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    SaleTargetId?: number
    TargetMonth?: string
    EmployeeName?: string
    MobileNumber?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SaleTargetData {
    SaleTargetId: number | 0
    ProjectId: number | 0
    TargetMonth?: string | ''
    EmployeeName?: string | ''
    MobileNumber?: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | ''
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | ''
    LastModifiedBy: string | ''
    LastModifiedDate: string | ''
}

export interface AddUpdateSaleTargetRequest {
    Uniquekey: string | null
    ProjectId: number | 0
    TargetMonth: string | null
    SaleTargetJSON: string | null
}

export interface DeleteSaleTargetRequest {
    SaleTargetId: number
    ProjectId: number
    Uniquekey: string
}

export type SaleTargetListResponse = ApiResponse<SaleTargetData[]>;
export type SaleTargetSaveResponse = ApiResponse<SaleTargetData[]>;
export type SaleTargetDeleteResponse = ApiResponse<number>;