import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeResignationRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  EmployeeResignationId?: number
  EmployeeId?: number
  ResignationDateFrom?: string | null
  ResignationDateTo?: string | null
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeResignationData {
  EmployeeResignationId: number
  UniqueKey: string | null
  EmployeeId: number | null
  EmployeeName: string | ''
  ResignationDate: string | null
  ReasonOfLeaving: string | ''
  ExpectedRelievingDate: string | null
  IsAnyOfferInHand: boolean
  OfferLetterURL: string | ''
  OfferAmount: number | null
  ApprovalStatus: string | ''
  CreatedById: number | null
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | null
  ModifiedBy: string | ''
  ModifiedDate: string | null
  Message: string | ''
  TotalRecords: number
}

export interface AddUpdateEmployeeResignationRequest {
  EmployeeResignationId: number
  UniqueKey: string | null
  EmployeeId: number | null
  ResignationDate: string | null
  ReasonOfLeaving: string | ''
  ExpectedRelievingDate: string | null
  IsAnyOfferInHand: boolean
  OfferLetterURL?: FileList | null
  RemoveOfferLetterURL?: string | ''
  OfferAmount: number | null
}

export interface DeleteEmployeeResignationRequest {
  EmployeeResignationId: number
  UniqueKey: string | null
}

export interface EmployeeResignationListResponse extends ApiResponse {
  Data: EmployeeResignationData[]
  TotalNumberOfRecord: number
}

export interface EmployeeResignationSaveResponse extends ApiResponse {
  Data: EmployeeResignationData[]
}

export interface EmployeeResignationDeleteResponse extends ApiResponse {
  Data: number[]
}

