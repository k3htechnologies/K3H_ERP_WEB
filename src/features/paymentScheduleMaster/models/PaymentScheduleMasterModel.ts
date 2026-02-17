import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentScheduleMasterRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    Type?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PaymentScheduleMasterData {
    PaymentScheduleMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    StageId: number | 0
    Type: string | null
    Date: string | null
    Name: string | null
    Percentage: number | 0
    Cumulative: number | 0
    Amount: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdatePaymentScheduleMasterRequest {
    PaymentScheduleMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    Type: string | null
    Name: string | null;
    Date: string | null
    Percentage: number | 0
    StageId: number | 0

}

export interface DeletePaymentScheduleMasterRequest {
    PaymentScheduleMasterId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type PaymentScheduleMasterListResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterSaveResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterDeleteResponse = ApiResponse<number[]>;