import type { ApiResponse } from "@/core/api/ApiResponse";

export interface InventoryDashboardDataset {
  Table0: any[];
  Table1: any[];
  Table2: any[];
  Table3: any[];
  Table4: any[];
  Table5: any[];
}

export type InventoryDashboardDatasetResponse = ApiResponse<InventoryDashboardDataset>;
