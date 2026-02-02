import type { ApiResponse } from "@/core/api/ApiResponse";

export interface RedevelopmentDashboardDataset {
  Table0: any[];
  Table1: any[];
  Table2: any[];
  Table3: any[];
  Table4: any[];
  Table5: any[];
}

export type RedevelopmentDashboardDatasetResponse = ApiResponse<RedevelopmentDashboardDataset>;
