import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentScheduleMasterRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    PaymentScheduleMasterId?: number
    BuildingId?: number
    Stage?: string
    Wing?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PaymentScheduleMasterData {
    PaymentScheduleMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    BuildingId: number | 0
    Stage: string | null
    Wing: string | null
    FlatConfiguration: string | null
    PaymentSchedulePercentage: number | 0
    PaymentScheduleCummulativePercentage: number | 0
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
    BuildingId: number | 0
    Stage: string | null;
    Wing: string | null
    PaymentSchedulePercentage: number | null
    PaymentScheduleCummulativePercentage: number
}

export interface DeletePaymentScheduleMasterRequest {
    PaymentScheduleMasterId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export interface FilterWithPaginationProjectInventoryStructureRequest {
    ProjectId?: number
    BuildingId?: number
    Wing?: string
    FlatConfiguration?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProjectInventoryStructureData {
    BuildingId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    Wing: string | null
    FlatConfiguration: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

// PAYMENT SCHEDULE REPORT

export interface FilterWithPaginationPaymentScheduleMasterReportRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BuildingId?: number
    PaymentScheduleMasterId?: number
    Rate?: number
    Wing?: string
    FlatConfiguration?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PaymentScheduleMasterReportData {
    PaymentScheduleMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    BuildingId: number | 0
    Wing: string | null
    Name: string | null
    Rate: number | 0
    TotalValue: number | 0
    PaymentSchedulePercentage: number | 0
    CarpetArea: number | 0
    FlatConfiguration: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface FilterWithPaginationCostSheetReportRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BuildingId?: number
    PaymentScheduleMasterId?: number
    Rate?: number
    Wing?: string
    FlatConfiguration?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CostSheetReportData {
    PaymentScheduleMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    BuildingId: number | 0
    Wing: string | null
    Rate: number | 0
    FlatConfiguration: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export type PaymentScheduleMasterListResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterSaveResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterDeleteResponse = ApiResponse<number[]>;

export type ProjectInventoryStructureListResponse = ApiResponse<ProjectInventoryStructureData[]>;

// PAYMENT SCHEDULE REPORT
export type PaymentScheduleMasterReportListResponse = ApiResponse<PaymentScheduleMasterReportData[]>;
export type CostSheetReportListResponse = ApiResponse<CostSheetReportData[]>;
