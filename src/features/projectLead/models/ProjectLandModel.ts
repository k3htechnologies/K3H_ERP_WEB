import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationProjectLandRequest {
    PageSize: number;
    PageNumber: number;
    IsCheckPermission?: boolean;
    ProjectLandId?: number;
    LandOwnerName?: string;
    LandAddress?: string;
    ContactPersonName?: string;
    ContactPersonMobile?: string;
    PinCode?: string;
    PlotNumber?: string;
    WardNumberZone?: string;
    PlotShape?: string;
    LandOwnershipType?: string;
    FromDate?: string;
    ToDate?: string;
    SortBy?: string;
    ExportType?: "Excel" | "PDF";
}

export interface ProjectLandData {
    ProjectLandId: number;
    Uniquekey: string | null;
    LandOwnerName: string | null;
    LandAddress: string | null;
    CountryMasterId: number | 0;
    CountryName: string | null;
    StateMasterId: number | 0;
    StateName: string | null;
    DistrictMasterId: number | 0;
    DistrictName: string | null;
    CityMasterId: number | 0;
    CityName: string | null;
    PinCode: string | null;
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: string | null;
    WardNumberZone: string | null;
    TotalPlotAreaSqM: number | 0;
    IdentificationLocation: string | null;
    LatitudeLongitude: string | null;
    ContactPersonName: string | null;
    ContactPersonMobile: string | null;
    ContactPersonEmail: string | null;
    IsAnyPowerofAttorneyInvolved: boolean;
    IsFencingBoundaryWallPresent: boolean;
    PlotShape: string | null;
    Frontage: number | 0;
    PlotDepth: number | 0;
    RoadWidth: string | null;
    SoilType: string | null;
    ExistingGroundCondition: string | null;
    IsLandConvertedToNonAgricultural: boolean;
    IsAccessRoadAvailable: boolean;
    IsElectricityConnectionNearby: boolean;
    IsUnderLitigationOrStayOrder: boolean;
    Is712Available: boolean;
    FSIPermissible: number | 0;
    WaterSupplyAvailable: string | null;
    SurroundingLandUse: string | null;
    TypeOfLandTenureType: string | null;
    LandOwnershipType: string | null;
    DistanceFromNearestTownKM: number | 0;
    DistanceFromHighwayKM: number | 0;
    DistanceFromRailwayStationKM: number | 0;
    DistanceFromAirportKM: number | 0;
    TotalNumberOfTreesonSite: number | 0;
    PhotoURL: string | null;
    Remark: string | null;
    ClientRegistrationId: number | 0;
    CreatedById: number | 0;
    CreatedBy: string;
    CreatedDate: string | null;
    ModifiedById: number | 0;
    ModifiedBy: string;
    ModifiedDate: string | null;
    LastModifiedBy: string;
    LastModifiedDate: string | null;
    DeletedById: number | 0;
    DeletedBy: string | null;
    DeletedDate: string | null;
}

export interface AddUpdateProjectLandData {
    ProjectLandId: number;
    Uniquekey: string | null;
    LandOwnerName: string | null;
    LandAddress: string | null;
    CountryMasterId: number | 0;
    StateMasterId: number | 0;
    DistrictMasterId: number | 0;
    CityMasterId: number | 0;
    PinCode: string | null;
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: string | null;
    WardNumberZone: string | null;
    TotalPlotAreaSqM: number | 0;
    IdentificationLocation: string | null;
    LatitudeLongitude: string | null;
    ContactPersonName: string | null;
    ContactPersonMobile: string | null;
    ContactPersonEmail: string | null;
    IsAnyPowerofAttorneyInvolved: boolean;
    IsFencingBoundaryWallPresent: boolean;
    PlotShape: string | null;
    Frontage: number | 0;
    PlotDepth: number | 0;
    RoadWidth: string | null;
    SoilType: string | null;
    ExistingGroundCondition: string | null;
    IsLandConvertedToNonAgricultural: boolean;
    IsAccessRoadAvailable: boolean;
    IsElectricityConnectionNearby: boolean;
    IsUnderLitigationOrStayOrder: boolean;
    Is712Available: boolean;
    FSIPermissible: number | null;
    WaterSupplyAvailable: string | null;
    SurroundingLandUse: string | null;
    TypeOfLandTenureType: string | null;
    LandOwnershipType: string | null;
    DistanceFromNearestTownKM: number | 0;
    DistanceFromHighwayKM: number | 0;
    DistanceFromRailwayStationKM: number | 0;
    DistanceFromAirportKM: number | 0;
    TotalNumberOfTreesonSite: number | 0;
    PhotoURL: string | null;
    RemovePhotoURL: string | "";
    Remark: string | null;
}

export interface DeleteProjectLandRequest {
    ProjectLandId: number | 0;
    Uniquekey: string | null;
}

export type ProjectLandListResponse = ApiResponse<ProjectLandData[]>;
export type ProjectLandSaveResponse = ApiResponse<ProjectLandData[]>;
export type DeleteProjectLandResponse = ApiResponse<number>;