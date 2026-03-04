import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationAttendanceRequest {
  PageSize?: number;
  PageNumber?: number;
  AttendanceId?: number;
  StartDate?: string | null;
  EndDate?: string | null;
  ApiKey?: string;
  SortBy?: string;
  IsReport?: boolean;
  ExportType?: "Excel" | "PDF";
  EmployeeName?: string;
}

export interface AttendanceData {
  EmployeeId: number;
  FullName: string;
  AttendanceId?: number | null;
  AttendanceDate: string;
  PunchIn?: string | null;
  PunchOut?: string | null;
  PunchInAddress?: string | null;
  PunchOutAddress: string;
  WorkingHours: string;
  AttendanceStatus: string;
  StartLatitude?: number | null;
  StartLongitude?: number | null;
  EndLatitude?: number | null;
  EndLongitude?: number | null;
  Polyline?: string | null;
  Distance?: number | null;
  CreatedById?: number | null;
  CreatedBy?: string | null;
  CreatedDate?: string | null;
  ModifiedById?: number | null;
  ModifiedBy?: string | null;
  ModifiedDate?: string | null;
}

export interface AddUpdateAttendance {
  AttendanceId: number;
  Uniquekey?: string;
  PunchAddress?: string;
}

export type AttendanceListResponse = ApiResponse<AttendanceData[]>;
export type AttendanceSaveResponse = ApiResponse<AttendanceData[]>;

/* ================= ATTENDANCE REGULARIZATION ================= */

export interface AttendanceRegularizationData {
  AttendanceRegularizationId: number;
  Uniquekey: string;
  AttendanceDate: string;
  PunchIn?: string | null;
  PunchOut?: string | null;
  Reason: string;
  Status?: string | null;
  CreatedById?: number | null;
  CreatedBy?: string | null;
  CreatedDate?: string | null;
  ModifiedById?: number | null;
  ModifiedBy?: string | null;
  ModifiedDate?: string | null;
}

export interface AddUpdateAttendanceRegularization {
  AttendanceRegularizationId?: number | null;
  Uniquekey?: string | null;
  AttendanceDate?: string | null;
  PunchIn?: string | null;
  PunchOut?: string | null;
  Reason?: string | null;
}

export interface FilterWithPaginationAttendanceRegularizationRequest {
  PageSize?: number;
  PageNumber?: number;
  AttendanceRegularizationId?: number;
  StartDate?: string | null;
  EndDate?: string | null;
  EmployeeId?: number;
  EmployeeName?: string;
  SortBy?: string;
  IsReport?: boolean;
  ExportType?: "Excel" | "PDF";
}

export type AttendanceRegularizationListResponse = ApiResponse<
  AttendanceRegularizationData[]
>;
export type AttendanceRegularizationSaveResponse = ApiResponse<
  AttendanceRegularizationData[]
>;
