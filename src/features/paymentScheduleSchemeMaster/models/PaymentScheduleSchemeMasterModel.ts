import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationPaymentScheduleSchemeMaster {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  IsCheckPermission?: boolean;
  PaymentScheduleScheme?: string;
  PaymentScheduleSchemeMasterId?: number;
  InventoryBuildingId?: number;
  BuildingNumber?: string;
  InventoryFlatFloorBasementPodiumWingId?: number;
  Wing?: string;
  SortBy?: string;
  ExportType?: "PDF" | "Excel";
}

export interface PaymentScheduleSchemeMasterData {
  PaymentScheduleSchemeMasterId: number;
  Uniquekey: string;
  ProjectId: number | 0;
  InventoryBuildingId?: number;
  InventoryFlatFloorBasementPodiumWingId?: number;
  BuildingNumber: string;
  Wing: string;
  PaymentScheduleScheme: string;
  OrderBy: number | 0;
  IsExistsPaymentScheduleScheme: boolean;

  CreatedById: number | 0;
  CreatedBy: string | "";
  CreatedDate: string | null;

  ModifiedById: number | 0;
  ModifiedBy: string | "";
  ModifiedDate: string | null;
}

export interface AddUpdatePaymentScheduleSchemeMasterRequest {
  PaymentScheduleSchemeMasterId: number | 0;
  Uniquekey: string | null;
  ProjectId: number | 0;
  PaymentScheduleScheme: string;
  InventoryBuildingId?: number;
  InventoryFlatFloorBasementPodiumWingId?: number;
  OrderBy: number | 0;
}

export interface DeletePaymentScheduleSchemeMasterRequest {
  PaymentScheduleSchemeMasterId: number;
  ProjectId: number;
  Uniquekey: string;
}

export type PaymentScheduleSchemeMasterListResponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterSaveReponse = ApiResponse<PaymentScheduleSchemeMasterData[]>;
export type PaymentScheduleSchemeMasterDeleteResponse = ApiResponse<number>;
