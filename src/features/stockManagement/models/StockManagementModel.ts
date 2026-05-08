import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationStockManagementRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MaterialName?: string
    SubMaterialName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface StockManagementRequestData {
    MaterialName: string | null
    SubMaterialName: string | null
    SubMaterialMasterId: number | 0
    UomCode: string | null
    TotalMaterialQuantityInStock: number | null
    AvailableMaterialQuantityInStock:number | null
}

export interface FilterWithPaginationStockManagementHistoryRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    SubMaterialMasterId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface StockManagementRequestHistoryData {
    MaterialName: string | null
    SubMaterialName: string | null
    SubMaterialMasterId: number | 0
    UomCode: string | null
    MaterialQuantityInwardOutward: number | 0
    InwardOutwardType: string | null
    Reason: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
}

export interface AddUpdateStockManagementRequest {
    SubMaterialMasterId: number | 0
    ProjectId: number | 0
    Reason: string | null
    InwardOutwardType: string | null
    MaterialQuantityInwardOutward: number | 0
}

export type StockManagementListResponse = ApiResponse<StockManagementRequestData[]>
export type StockManagementHistoryListResponse = ApiResponse<StockManagementRequestHistoryData[]>
export type StockManagementSaveResponse = ApiResponse<AddUpdateStockManagementRequest[]>