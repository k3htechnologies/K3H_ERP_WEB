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
  GoogleLocation: string;
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

  VillageMasterId: number | null;
  VillageName: string;

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
  GoogleLocation?: string | '';
  TotalPlotAreaSqFt: number | null;
  RoadWidth: string;
  CountryMasterId: number | null;
  DistrictMasterId: number | null;
  StateMasterId: number | null;
  CityMasterId: number | null;
  VillageMasterId: number | null;
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


// BUILDING DETAILS
export interface FilterWithPaginationBuildingDetailsRequest {

  ProjectId?: number
  BuildingId?: number
  ExportType?: 'Excel' | 'PDF'
}

export interface BuildingDetailsData {
  BuildingId: number;
  ProjectId: number;

  // ===================== [BUILDING PLOT AREA] =====================
  GrossPlotAreaSqFt: number;
  PlotAreaPhysicalSurveySqFt?: number | null;
  PlotAreaOldApprovedPlanSqFt?: number | null;
  PlotAreaConveyanceSqFt?: number | null;
  PlotAreaPRCardSqFt?: number | null;

  // ===================== [BUILDING CONSTRUCTION DETAILS] =====================
  TotalBuiltUpAreaSqFt: number;
  TotalResidentialUnits?: number | null;
  TotalResidentialCarpetAreaSqFt?: number | null;
  TotalCommercialUnits?: number | null;
  TotalCommercialCarpetAreaSqFt?: number | null;

  // ===================== [BUILDING KEY CONTACT DETAILS] =====================
  BuildingKeyContactDetailsData?: BuildingKeyContactDetails[];

  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface BuildingKeyContactDetails {
  BuildingKeyContactDetailsId: number;
  Uniquekey?: string | null;
  BuildingId: number;
  ProjectId: number;

  // ===================== [CONTACT DETAILS] =====================
  ContactType?: string | null;
  ContactName?: string | null;
  MobileNumber?: string | null;
  EmailId?: string | null;

  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateBuildingDetailsRequest {
  BuildingId: number;
  ProjectId: number;

  // ===================== [BUILDING PLOT AREA] =====================
  GrossPlotAreaSqFt: number;
  PlotAreaPhysicalSurveySqFt?: number;
  PlotAreaOldApprovedPlanSqFt?: number;
  PlotAreaConveyanceSqFt?: number;
  PlotAreaPRCardSqFt?: number;

  // ================== [BUILDING CONSTRUCTION DETAILS] ==============
  TotalBuiltUpAreaSqFt: number;
  TotalResidentialUnits?: number;
  TotalResidentialCarpetAreaSqFt?: number;
  TotalCommercialUnits?: number;
  TotalCommercialCarpetAreaSqFt?: number;

  // ================== [BUILDING KEY CONTACT DETAILS] ===============
  BuildingKeyContactDetailsJSON?: string;
}

export type BuildingDetailsListResponse = ApiResponse<BuildingDetailsData[]>;
export type BuildingDetailsSaveResponse = ApiResponse<BuildingDetailsData[]>;

// BUILDING DOCUMENT
export interface FilterWithPaginationBuildingDocumentRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  ProjectId?: number
  BuildingId?: number
  BuildingDocumentId?: number
  DocumentName?: string | ''
  DocumentStatus?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface BuildingDocumentData {
  BuildingDocumentId: number;
  Uniquekey?: string | null;
  BuildingId: number;
  BuildingName?: string | null;
  ProjectId: number;
  DocumentName?: string | null;
  DocumentURL?: string | null;
  DocumentRemark?: string | null;
  IsMaster?: number | 0;
  UploadedBuildingDocumentCount: number;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateBuildingDocumentRequest {
  BuildingDocumentId: number;
  Uniquekey?: string | null;
  BuildingId: number;
  ProjectId: number;
  DocumentName?: string | null;
  DocumentURL?: File[] | null;
  RemoveDocumentURL?: string | null;
  DocumentRemark?: string | null;
  IsMaster?: number | 0;
}

export interface DeleteBuildingDocumentRequest {

  BuildingDocumentId: number
  UniqueKey: string
  BuildingId: number
  ProjectId: number
}

export type BuildingDocumentListResponse = ApiResponse<BuildingDocumentData[]>;
export type BuildingDocumentSaveResponse = ApiResponse<BuildingDocumentData[]>;
export type BuildingDocumentDeleteResponse = ApiResponse<number>;


