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
    PaymentScheduleSchemeMasterId: number
    Uniquekey: string
    ProjectId: number
    PaymentScheduleScheme: string
    InventoryBuildingId: number
    BuildingNumber: string
    Wing: string
    InventoryFlatFloorBasementPodiumWingId: number
    OrderBy: number
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null
    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface AddUpdatePaymentScheduleSchemeMasterRequest {
    PaymentScheduleSchemeMasterId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0,
    InventoryBuildingId: number | 0,
    PaymentScheduleScheme: string,
    OrderBy: number | 0,
    InventoryFlatFloorBasementPodiumWingId: number | 0,
    Wing: string,
}

export interface DeletePaymentScheduleSchemeMasterRequest {
    PaymentScheduleSchemeMasterId: number,
    ProjectId: number,
    Uniquekey: string,
}

export type PaymentScheduleSchemeMasterListResponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterSaveReponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterDeleteResponse = ApiResponse<number>;



