import type { ApiResponse } from "@/core/api/ApiResponse";
// 
export interface PayrollDashboardDataset {
  Table0: any[];
  Table1: any[];
  Table2: any[];
  Table3: any[];
  Table4: any[];
  Table5: any[];
}

export interface FilterWithPaginationPayrollDashboard {
  PageSize: number;
  PageNumber: number;
  StartDate?: string;
  EndDate?: string;
  EmployeeName?: string | null;
}

export interface PayrollDashboardDatasetMaster {
  PageSize: number;
  PageNumber: number;
  Uniquekey: string | null
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
  StartDate?: string | null;
  EndDate?: string | null;

}

export type PayrollDashboardDatasetResponse = ApiResponse<PayrollDashboardDataset>;
export type PayrollDashboardDatasetListResponse = ApiResponse<PayrollDashboardDatasetMaster[]>;

