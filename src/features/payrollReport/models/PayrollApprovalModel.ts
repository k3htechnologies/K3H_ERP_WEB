import type { ApiResponse } from "@/core/api/ApiResponse"

export interface AddPayrollApprovalRequest {
  ApprovalJson: string
}

export interface PayrollApprovalData {
  ModuleName: string
  Id: number
  Status: string
  Remarks: string
  EmployeeName: string
  ApprovalStatus:string
  CreatedBy?: string | null
  CreatedDate?: string | null
}

export interface FilterWithPayrollApprovalStatus{
  ModuleName: string
  Id: number
  RequestId: number
  Remarks:string
}

export type PayrollApprovalListResponse = ApiResponse<PayrollApprovalData[]>