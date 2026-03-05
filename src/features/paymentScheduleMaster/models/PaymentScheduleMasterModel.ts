import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationPaymentScheduleMasterRequest {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  PaymentScheduleSchemeMasterId?: number;
  PaymentScheduleMasterId?: number;
  InventoryBuildingId?: number;
  InventoryFlatFloorBasementPodiumWingId?: number;
  Stage?: string;
  SortBy?: string;
  ExportType?: "Excel" | "PDF";
}

export interface PaymentScheduleMasterData {
  PaymentScheduleMasterId: number | 0;
  Uniquekey: string | null;
  PaymentScheduleSchemeMasterId: number | 0;
  PaymentScheduleScheme: string | null;
  Stage: string | null;
  PaymentSchedulePercentage: number | 0;
  PaymentScheduleCummulativePercentage: number | 0;
  InventoryBuildingId: number | 0;
  BuildingNumber: string | null;
  InventoryFlatFloorBasementPodiumWingId?: number;
  Wing: string | null;
  CreatedById: number | 0;
  CreatedBy: string | "";
  CreatedDate: string | null;
  ModifiedById: number | 0;
  ModifiedBy: string | "";
  ModifiedDate: string | null;
  LastModifiedBy: string | "";
  LastModifiedDate: string | null;
}

export interface AddUpdatePaymentScheduleMasterRequest {
  PaymentScheduleMasterId: number | 0;
  Uniquekey: string | null;
  ProjectId: number | 0;
  InventoryBuildingId: number | 0;
  InventoryFlatFloorBasementPodiumWingId?: number;
  Stage: string | null;
  PaymentSchedulePercentage: number | null;
  PaymentScheduleCummulativePercentage: number;
  PaymentScheduleSchemeMasterId: number | null;
}

export interface DeletePaymentScheduleMasterRequest {
  PaymentScheduleMasterId: number | null;
  Uniquekey: string;
  ProjectId: number | null;
}

export type PaymentScheduleMasterListResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterSaveResponse = ApiResponse<PaymentScheduleMasterData[]>;
export type PaymentScheduleMasterDeleteResponse = ApiResponse<number[]>;
