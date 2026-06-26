import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCostTracking {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    CostTrackingId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface CostTrackingData {
    ProjectId: number | 0
    CostTrackingId: number | 0
}

export interface AddUpdateCostTrackingData {
    ProjectId: number | 0
    CostTrackingId: number | 0
}

export type CostTrackingListResponse = ApiResponse<CostTrackingData[]>;
export type CostTrackingSaveResponse = ApiResponse<CostTrackingData[]>;