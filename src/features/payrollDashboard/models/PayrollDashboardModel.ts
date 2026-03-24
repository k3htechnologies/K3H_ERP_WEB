import type { ApiResponse } from "@/core/api/ApiResponse";

export interface PayrollDashboardDataset {
  Table0: Table0[];
  Table1: Table1[];
  Table2: Table2[];
  Table3: Table3[];
  Table4: Table4[];
  Table5: Table5[];
}

export interface Table0 {
  OnLeave: string | null;
  Outdoor: string | null;
  PendingApproval: string | null;
  AttendanceAlert: string | null;
}

export interface Table1 {
  FullName: string | null;
  NoOfDays: string | null;
  StartDate: string | null;
  EndDate: string | null;
  LeaveTypeMasterId: string | null;
  status: string | null;
}

export interface Table2 {
  CompoffDate: string | null;
  WorkingDate: string | null;
  CreatedBy: string | null;
  CreatedDate: string | null;
  status: string | null;
}

export interface Table3 {
  CompanyName: string | null;
  CreatedBy: string | null;
  OutDoorDate: string | null;
  OutDoorTime: string | null;
}

export interface Table4 {
  FullName: string | null;
  ResignationDate: string | null;
  Reason: string | null;
  status: string | null;
}

export interface Table5 {
  TotalEmployees: number | null;
  PresentCount: number | null;
  AbsentCount: number | null;
  OnLeaveCount: number | null;
}

export interface FilterWithPaginationPayrollDashboard {
  PageSize: number;
  PageNumber: number;
  StartDate?: string;
  EndDate?: string;
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

