import type { ApiResponse } from "@/core/api/ApiResponse";
export interface FilterWithPaginationConstructionAreaRequest {
  PageSize: number
  PageNumber: number
  ProjectId: number
  InventoryFlatId?: number
  BuildingNumber?: string
  Wing?: string
  Floor?: string
  Flat?: string
  RERACarpetAreaSqFt?: number
  FlatType?: string
  FlatConfiguration?: string
  FlatFacing?: string
  FlatStatus?: string
  IsCheckPermission?: boolean
  ApprovalStatus?: string
  constructionAreaId?: number
  SortBy?:string
  ExportType?: "Excel" | "PDF" | "Sample";
}

export interface ConstructionAreaData {
  ConstructionAreaId: number;
  Uniquekey: string;
  ProjectId: number;
  InventoryFlatId: number;
  BuildingNumber: string;
  Wing: string;
  Floor: string;
  Flat: string;
  RERACarpetAreaSqFt: number;
  FlatType: string;
  FlatConfiguration: string;
  FlatStatus: 'Alloted' | "Available" | "Booked" | "Blocked" | "Hold";
  FlatFacing: string;
  AreaByPLLineSqMt: number;
  MultiplierForAreaPercentage: number;
  TotalAreaSqMt: number;
  TotalAreaSqFt: number;
  FloorToFloorHeightMt: number;
  CumulativeHeightMt: number;
  Remark:string;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: string;
}

export interface AddUpdateConstructionAreaRequest {
  ConstructionAreaId: number | 0;
  Uniquekey: string | "";
  ProjectId: number | 0;
  InventoryFlatId: number | 0;
  AreaByPLLineSqMt: number | 0;
  MultiplierForAreaPercentage: number | 0;
  FloorToFloorHeightMt: number | 0;
  Remark:string | ""

}

export type ConstructionAreaListResponse = ApiResponse<ConstructionAreaData[]>;
export type ConstructionAreaSaveResponse = ApiResponse<ConstructionAreaData[]>;
