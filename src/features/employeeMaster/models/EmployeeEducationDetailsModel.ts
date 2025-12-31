import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeEducationDetailsRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  EmployeeId?: number
  EmployeeEducationDetailsId?: number
  Qualification?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeEducationDetailsData {
  EmployeeEducationDetailsId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  FullName?: string | null;
  Qualification?: string | null;
  CollegeName?: string | null;
  Passing?: string | null;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateEmployeeEducationDetailsRequest {
  EmployeeEducationDetailsId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  Qualification?: string | null;
  CollegeName?: string | null;
  Passing?: string | null;
}

export interface DeleteEmployeeEducationDetailsRequest {

  EmployeeEducationDetailsId: number
  UniqueKey: string
  EmployeeId: number
}

export type EmployeeEducationDetailsListResponse = ApiResponse<EmployeeEducationDetailsData[]>;
export type EmployeeEducationDetailsSaveResponse = ApiResponse<EmployeeEducationDetailsData[]>;
export type EmployeeEducationDetailsDeleteResponse = ApiResponse<number>;