import type { ApiResponse } from "@/core/api/ApiResponse";

export interface UserDashboardDataset {
  Table0: Table0[]
  Table1: Table1[]
  Table2: Table2[];
  Table3: Table3[];
  Table4: Table4[];
  Table5: Table5[];
  Table6: Table6[];
  Table7: Table7[];
  Table8: Table8[];
  Table9: Table9[];
  Table10: Table10[];
  Table11: Table11[];
}

export interface Table0 {
  Name: string | null;
  Department: string | null;
  EmployeeCode: string | null;
  Status: string | null;
  PunchIn: string | null;
  PunchOut: string | null;
}

export interface Table1 {
  PresentDays: number | null;
  AvgLoginTime: string | null;
  ShiftName: string | null;
  ShiftBeginTime: string | null;
  ShiftEndTime: string | null;
}

export interface Table2 {
  ThisMonthHours: string | null;
  ThisWeekHours: string | null;
  OvertimeHours: string | null;
  AvgDailyHours: string | null;
  Message?: string | null;
}

export interface Table3 {
  AttendanceDate: string | null;
  EmployeeId: number | null;
  FullName: string | null;
  WorkingHours: string | null;
  AttendanceId: number | null;
  DayName: string | null;
  PunchIn: string | null;
  PunchOut: string | null;
  PunchInAddress: string | null;
  PunchOutAddress: string | null;
}

export interface Table4 {
  TotalLeaves: number | null;
  UsedLeaves: number | null;
  RemainingLeaves: number | null;
  LeaveTypeName: string | null;
  LeaveTypeMasterId: number | null;
}

export interface Table5 {
  LeaveId: number | null;
  StartDate: string | null;
  EndDate: string | null;
  NoOfDays: number | null;
  LeaveTypeName: string | null;
  Reason: string | null;
}

export interface Table6 {
  // No response coming from backend for this table
}

export interface Table7 {
  TotalEmployees: number | null;
  PresentCount: number | null;
  OnLeaveCount: number | null;
  AbsentCount: number | null;

}

export interface Table8 {
  FullName: string | null;
  DateOfBirth: string | null;
  DepartmentName: string | null;
}

export interface Table9 {
  // No response coming from backend for this table
}

export interface Table10 {
  ManagerId: number | null;
  ManagerName: string | null;
  ManagerEmail: string | null;
  ManagerPhone: string | null;
  ManagerDepartment: string | null;
  ManagerDesignation: string | null;
}

export interface Table11 {
  PunchOut: string | null;
  PunchIn: string | null;
  StartLatitude: number | null;
  StartLongitude: number | null;
  EndLatitude: number | null;
  EndLongitude: number | null;
  Distance: number | null;
  Polyline: string | null;

}

export type UserDashboardDatasetResponse = ApiResponse<UserDashboardDataset>;