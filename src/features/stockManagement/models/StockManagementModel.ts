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
    MaterialId: number | 0
    SubMaterialName: string | null
    SubMaterialMasterId: number | 0
    UomCode: string | null
    SystemGeneratedCode: string | null
    TotalMaterialQuantityInStock: number | 0
    AvailableMaterial: number | 0
    UsedQuantity: number | 0
    ScrapQuantity: number | 0
}

export interface AddUpdateStockManagementRequest {
    SubMaterialMasterId: number | 0
    ProjectId: number | 0
    Reason: string | null
    InwardOutwardType: string | null
    MaterialQuantityInwardOutward: number | 0
    PartyName: string | null
    TransferNoteURL: File[] | null
    RemoveTransferNoteURL: string | null
}

export interface FilterWithPaginationStockManagementHistoryRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    SubMaterialMasterId?: number
    type?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface StockManagementHistoryData {
    MaterialName: string | null
    SubMaterialName: string | null
    SubMaterialMasterId: number | 0
    UomCode: string | null
    MaterialQuantityInwardOutward: number | 0
    TransferNoteURL: string | null
    InwardOutwardType: string | null
    PartyName: string | null
    Reason: string | null
    UsedMaterial: number | 0
    UnUsedMaterial: number | 0
    MaterialRequisitionGRNStockId: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
}

export interface FilterWithPaginationStockManagementSummaryRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    MaterialId?: number
    SubMaterialId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface AddUpdateStockUsage {
    ProjectId: number | 0,
    MaterialRequisitionGRNStockId: number | 0,
    SubMaterialMasterId: number | 0,
    UsedQuantity: number | 0
    UnusedQuantity: number | 0
}

export type StockManagementListResponse = ApiResponse<StockManagementRequestData[]>
export type StockManagementSaveResponse = ApiResponse<StockManagementRequestData[]>
export type StockManagementHistoryListResponse = ApiResponse<StockManagementHistoryData[]>
