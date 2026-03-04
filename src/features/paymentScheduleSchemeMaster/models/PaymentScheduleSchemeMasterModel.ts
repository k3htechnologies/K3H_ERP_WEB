import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentScheduleSchemeMaster {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    PaymentScheduleScheme?: string
    PaymentScheduleSchemeMasterId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface PaymentScheduleSchemeMasterData {
    PaymentScheduleSchemeId: number,
    Uniquekey: string,
    ProjectId: number | 0,
    
    PaymentScheduleSchemeName: string,
    OrderBy: number | 0,

    CreatedById: number | 0,
    CreatedBy: string | '',
    CreatedDate: string | null,

    ModifiedById: number | 0,
    ModifiedBy: string | '',
    ModifiedDate: string | null,
}

export interface AddUpdatePaymentScheduleSchemeMasterRequest {
    PaymentScheduleSchemeId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    PaymentScheduleScheme: string,
    OrderBy: number | 0,
}

export interface DeletePaymentScheduleSchemeMasterRequest {
    PaymentScheduleSchemeId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type PaymentScheduleSchemeMasterListResponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterSaveReponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterDeleteResponse = ApiResponse<number>;



