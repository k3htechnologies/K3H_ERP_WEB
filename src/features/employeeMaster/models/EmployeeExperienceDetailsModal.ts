import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeExperienceDetailsRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  EmployeeId?: number
  EmployeeExperienceDetailsId?: number
  CompanyName?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeExperienceDetailsData {
  EmployeeExperienceDetailsId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  FullName?: string | null;
  CompanyName?: string | null;
  Role?: string | null;
  Tenure?: string | null;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateEmployeeExperienceDetailsRequest {
  EmployeeExperienceDetailsId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  CompanyName?: string | null;
  Role?: string | null;
  Tenure?: string | null;
}

export interface DeleteEmployeeExperienceDetailsRequest {

  EmployeeExperienceDetailsId: number
  UniqueKey: string
  EmployeeId: number
}

export type EmployeeExperienceDetailsListResponse = ApiResponse<EmployeeExperienceDetailsData[]>;
export type EmployeeExperienceDetailsSaveResponse = ApiResponse<EmployeeExperienceDetailsData[]>;
export type EmployeeExperienceDetailsDeleteResponse = ApiResponse<number>;