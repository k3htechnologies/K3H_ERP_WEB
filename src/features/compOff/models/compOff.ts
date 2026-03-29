import type { ApiResponse } from "@/core/api/ApiResponse";

export interface CompOffData {
  CompOffId: number;
  Uniquekey: string;
  CompOffDate: string;
  WorkingDate: string;
  Reason: string;
  IsReport?: boolean;
  CreatedById: number | 0;
  CreatedBy: string | "";
  CreatedDate: string | null;
  ModifiedById: number | 0;
  ModifiedBy: string | "";
  ModifiedDate: string | null;
  LastModifiedBy: string | "";
  LastModifiedDate: string | null;
}

export interface AddUpdateCompOff {
  CompOffId?: number | null;
  Uniquekey?: string | null;
  CompOffDate?: string | null;
  WorkingDate?: string | null;
  Reason?: string | null;
}
export interface FilterWithPaginationCompOff {
  PageSize: number;
  PageNumber: number;
  CompOffId?: number;
  StartDate?: string | null;
  EndDate?: string | null;
  Reason?: string;
  Status?: string;
  EmployeeId?: number;
  EmployeeName?: string;
  SortBy?: string;
  IsReport?: boolean;
  CanApprove?: boolean
  ExportType?: "Excel" | "PDF";
}

export interface DeleteCompOffRequest {
  CompOffId?: number | null;
  Uniquekey?: string | null;
}

export interface PullCompOffDatesRequest {
  PageSize: number;
  PageNumber: number;
  EmployeeId?: number;
  StartDate?: string;
  EndDate?: string;
}

export interface CompOffDateItem {
  AttendanceDate: string; // ISO format: "2026-01-06T00:00:00"
}

export type CompOffListResponse = ApiResponse<CompOffData[]>;
export type CompOffSaveResponse = ApiResponse<CompOffData[]>;
export type CompOffDeleteResponse = ApiResponse<number>;
export type CompOffDatesResponse = ApiResponse<CompOffDateItem[]>;
