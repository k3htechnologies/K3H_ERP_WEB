import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPayTrackRentRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  ProjectId?: number
  BuildingId?: number
  TenantId?: number
  TenantApplicantId?: number
  PayTrackRentId?: number
  FlatNumber?: string | ''
  ApplicantName?: string | ''
  ChargeType?: string | ''
  Tenure?: string | null
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface AddUpdatePayTrackRentRequest {
  PayTrackRentId: number | null
  Uniquekey: string | null
  TenantId: number | null
  TenantApplicantId: number | null
  BuildingId: number | null
  ProjectId: number | null
  ProjectBankListMasterId: number | null
  AccountHolderName: string | null
  BankListMasterId: number | null
  AccountNumber: string | null
  IFSCCode: string | null
  PaymentMode: string | null
  AmountType: string | null
  PaymentType: string | null
  PayAmount: number | null
  TransactionChequeDemandDraftNumber: string | null
  TransactionChequeDemandDraftURL: File[] | null
  RemoveTransactionChequeDemandDraftURL: string
  TransactionChequeDemandDraftDate: string | null
  PaymentReceiptURL: File[] | null
  RemovePaymentReceiptURL: string
  Tenure: string | null
  ChargeType: string | null
}

export interface PayTrackRentLedgerData {
  PayTrackRentId: number | null
  Uniquekey: string | null
  TenantId: number | null
  TenantApplicantId: number | null
  BuildingId: number | null
  ProjectId: number | null

  // Tenant Details
  FlatNumber: string
  FlatCarpetAreaSqFt: number | null
  Facing: string | null
  FlatType: string
  FlatConfiguration: string | null

  // Applicant Details
  ApplicantType: string | null
  ApplicantName: string | null
  ApplicantMobileNumber: string | null
  ApplicantEmailId: string | null

  // Payment Details
  PaymentMode: string | null
  ProjectBankListMasterId: number | null
  ProjectBankName: string | null
  ProjectBankAccountNumber: string | null
  ProjectBankIFSCCode: string | null
  ProjectBankAccountHolderName: string | null

  BankListMasterId: number | null
  BankName: string | null
  AccountHolderName: string | null
  AccountNumber: string | null
  IFSCCode: string | null
  AmountType: string | null
  PaymentType: string | null
  PayAmount: number | null
  TransactionChequeDemandDraftNumber: string | null
  TransactionChequeDemandDraftURL: string | null
  TransactionChequeDemandDraftDate: string | null
  PaymentReceiptURL: string | null
  ApprovalStatus: string | null

  // User Details
  CreatedById: number | null
  CreatedBy: string | null
  CreatedDate: string | null
  ModifiedById: number | null
  ModifiedBy: string | null
  ModifiedDate: string | null

  // Rent Details
  Tenure: string | null
  ChargeType: string | null
}

export interface DeletePayTrackRentRequest {
  PayTrackRentId: number
  Uniquekey: string
  ProjectId: number
  TenantId: number
  TenantApplicantId: number
  BuildingId: number
}

export type PayTrackRentLedgerListResponse = ApiResponse<PayTrackRentLedgerData[]>
export type PayTrackRentSaveResponse = ApiResponse<PayTrackRentLedgerData[]>
export type PayTrackRentDeleteResponse = ApiResponse<number>

