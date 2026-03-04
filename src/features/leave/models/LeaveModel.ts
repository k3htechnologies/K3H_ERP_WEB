import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationLeaveRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  LeaveId?: number
  LeaveTypeMasterId?: number
  LeaveType?: string
  StartDate?: string | null
  EndDate?: string | null
  Status?: string
  EmployeeId?: number
  EmployeeName?: string
  SortBy?: string
  IsReport?: boolean
  ExportType?: 'Excel' | 'PDF'
}

export interface LeaveData {
  LeaveId: number
  Uniquekey: string
  LeaveTypeMasterId: number
  LeaveType: string
  LeaveTypeCode: string
  StartDate: string | null
  EndDate: string | null
  StartDateLeaveDuration: string
  EndDateLeaveDuration: string
  NoOfDays: number
  Reason: string
  LeaveDocumentURL: string
  CreatedById: number
  CreatedBy: string
  CreatedDate: string | null
  ModifiedById: number
  ModifiedBy: string
  ModifiedDate: string | null
  LastModifiedBy?: string
  LastModifiedDate?: string | null
}

import type { FileValue } from '@/ui/components/ImagePicker/MultiFilePicker'

export interface AddUpdateLeaveRequest {
  LeaveId?: number
  Uniquekey?: string
  LeaveTypeMasterId?: number
  StartDate?: string | null
  EndDate?: string | null
  StartDateLeaveDuration?: string
  EndDateLeaveDuration?: string
  Reason?: string
  LeaveDocumentFiles?: FileValue[]
  RemoveLeaveURL?: string | ''
}

export interface DeleteLeaveRequest {
  LeaveId: number
  Uniquekey: string
}

export type LeaveListResponse = ApiResponse<LeaveData[]>
export type LeaveSaveResponse = ApiResponse<LeaveData[]>
export type LeaveDeleteResponse = ApiResponse<number>
