import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeDocumentRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  EmployeeId?: number
  EmployeeDocumentId?: number
  DocumentName?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeDocumentData {
  EmployeeDocumentId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  FullName?: string | null;
  DocumentName?: string | null;
  DocumentURL?: string | null;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateEmployeeDocumentRequest {
  EmployeeDocumentId: number;
  Uniquekey?: string | null;
  EmployeeId: number;
  DocumentName?: string | null;
  DocumentURL?: File[] | null;
  RemoveDocumentURL?: string[] | null;
}

export interface DeleteEmployeeDocumentRequest {

  EmployeeDocumentId: number
  UniqueKey: string
  EmployeeId: number
}

export type EmployeeDocumentListResponse = ApiResponse<EmployeeDocumentData[]>;
export type EmployeeDocumentSaveResponse = ApiResponse<EmployeeDocumentData[]>;
export type EmployeeDocumentDeleteResponse = ApiResponse<number>;