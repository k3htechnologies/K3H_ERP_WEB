import type { ApiResponse } from "@/core/api/ApiResponse";
export interface SalesDashboardDataset {
    Table0: any[];
    Table1: any[];
}

export type SalesDashboardDatasetResponse = ApiResponse<SalesDashboardDataset>;