import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationEnquiryReportRequest {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  EmployeeName?: string;
  Stage?: string;
  Year?: number;
  FromDate?: string;
  ToDate?: string;
}

export interface ProjectWiseEmployeeList {
  EmployeeId?: number;
  FullName?: string;
  EnquiryStagesData?: EnquiryStages[];
  Message?: string;
  TotalRecords?: number;
}

export interface EnquiryStages {
  EmployeeId?: number;
  FullName?: string;
  MonthNumber?: number;
  MonthName?: string;
  Date?: string;
  Stages?: string;
  StagesCount?: number;
}
export type EnquiryReportResponse = ApiResponse<ProjectWiseEmployeeList[]>;
