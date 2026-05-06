import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInventoryParkingOverallReportRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number | null;
    SortBy?: string;
}

export interface InventoryParkingOverallReportData {
    Uniquekey: string | null;
    ProjectName: string | null;
    EnquiryId: number | null;
    SystemGeneratedCode: string | null;
}

export type InventoryParkingOverallReportResponse = ApiResponse<InventoryParkingOverallReportData[]>;


