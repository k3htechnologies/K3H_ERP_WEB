import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationIbmObmReportRequest {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  EmployeeName?: string;
  DepartmentName?: string;
  Stage?: string;
  Year?: number;
  FromDate?: string;
  ToDate?: string;
   ExportType?: 'Excel' | 'PDF'
}

export interface ProjectWiseIbmObmEmpoyeesList {
  EmployeeId?: number;
  FullName?: string;
  DesignationName?: string;
  IbmObmStagesData?: IbmObmStages[];
  Message?: string;
  TotalRecords?: number;
}

export interface IbmObmStages {
  EmployeeId?: number;
  FullName?: string;
  MonthNumber?: number;
  MonthName?: string;
  Date?: string;
  Stages?: string;
  StagesCount?: number;
}
export type IbmObmReportResponse = ApiResponse<ProjectWiseIbmObmEmpoyeesList[]>;
