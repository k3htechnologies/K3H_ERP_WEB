import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCompanyDocumentRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  CompanyId?: number
  CompanyDocumentId?: number
  DocumentName?: string | ''
  FinancialYear?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface CompanyDocumentData {
  CompanyDocumentId: number;
  Uniquekey?: string | null;
  CompanyId: number;
  FinancialYear?: string | null;
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

export interface AddUpdateCompanyDocumentRequest {
  CompanyDocumentId: number;
  Uniquekey?: string | null;
  CompanyId: number;
  FinancialYear: string | null;
  DocumentName?: string | null;
  DocumentURL?: File[] | null;
  RemoveDocumentURL?: string[] | null;
}

export interface DeleteCompanyDocumentRequest {

  CompanyDocumentId: number
  UniqueKey: string
  CompanyId: number
}

export type CompanyDocumentListResponse = ApiResponse<CompanyDocumentData[]>;
export type CompanyDocumentSaveResponse = ApiResponse<CompanyDocumentData[]>;
export type CompanyDocumentDeleteResponse = ApiResponse<number>;