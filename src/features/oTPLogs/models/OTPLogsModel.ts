import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationOTPLogsRequest {
    PageSize: number
    PageNumber: number
    Module?: string
    MobileNumber?: string
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface OTPLogsData {
    OTP: string | null
    Module: string | null
    MobileNumber: string | null,
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export type OTPLogsListResponse = ApiResponse<OTPLogsData[]>;