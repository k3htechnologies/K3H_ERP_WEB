import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBuildingRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  ProjectId?: number
  BuildingId?: number
  BuildingName?: string | ''
  CTSNumber?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface BuildingData {
  BuildingId: number;
  Uniquekey: string | null;
  ProjectId: number | null;

  BuildingName: string;
  CTSNumber: string;
  TotalPlotAreaSqFt: number | null;
  RoadWidth: string;

  CountryMasterId: number | null;
  CountryName: string;

  DistrictMasterId: number | null;
  DistrictName: string;

  StateMasterId: number | null;
  StateName: string;

  CityMasterId: number | null;
  CityName: string;

  TotalNumberOfUnits: number | null;
  TotalUnitsAreaUtilizedSqFt: number | null;

  IsGarden: boolean | null;
  TotalGardenAreaSqFt: number | null;

  IsReligiousStructure: boolean | null;
  TotalReligiousStructureAreaSqFt: number | null;

  PropertyAgeYears: number | null;
  NumberOfFloors: number | null;

  FSI_TDR_UtilizationSqFt: number | null;

  LandOwnershipType: string;

  IsLitigation: boolean | null;
  LitigationRemarks: string;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateBuildingRequest {
  BuildingId: number | null;
  Uniquekey: string | null;
  ProjectId: number | null;
  BuildingName: string;
  CTSNumber: string;
  TotalPlotAreaSqFt: number | null;
  RoadWidth: string;
  CountryMasterId: number | null;
  DistrictMasterId: number | null;
  StateMasterId: number | null;
  CityMasterId: number | null;
  TotalNumberOfUnits: number | null;
  TotalUnitsAreaUtilizedSqFt: number | null;
  IsGarden: boolean | null;
  TotalGardenAreaSqFt: number | null;
  IsReligiousStructure: boolean | null;
  TotalReligiousStructureAreaSqFt: number | null;
  PropertyAgeYears: number | null;
  NumberOfFloors: number | null;
  FSI_TDR_UtilizationSqFt: number | null;
  LandOwnershipType: string;
  IsLitigation: boolean | null;
  LitigationRemarks: string;
}

export interface DeleteBuildingRequest {
  BuildingId: number
  UniqueKey: string
  ProjectId: number
}

export type BuildingListResponse = ApiResponse<BuildingData[]>;
export type BuildingSaveResponse = ApiResponse<BuildingData[]>;
export type BuildingDeleteResponse = ApiResponse<number>;
