import type { ApiResponse } from "@/core/api/ApiResponse";

export interface LitigationDashboardDataset {
    Table0: any[];
    Table1: any[];
    Table2: any[];
    Table3: any[];
    Table4: any[];
    Table5: any[];
    Table6: any[];
}

export type LitigationDashboardDatasetResponse = ApiResponse<LitigationDashboardDataset>;
