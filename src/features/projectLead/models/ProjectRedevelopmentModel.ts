import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationProjectRedevelopmentRequest {
    PageSize: number;
    PageNumber: number;
    ProjectRedevelopmentId?: number;
    IsCheckPermission?: boolean;
    BuildingName?: string;
    BuildingAddress?: string;
    ContactPersonName?: string;
    ContactPersonMobile?: string;
    PinCode?: string;
    PlotNumber?: string;
    WardNumberZone?: string;
    ExistingBuildingType?: string;
    ConstructionType?: string;
    TypeOfLandTenure?: string;
    FromDate?: string;
    ToDate?: string;
    SortBy?: string;
    ExportType?: "Excel" | "PDF";
}

export interface ProjectRedevelopmentData {
    ProjectRedevelopmentId: number | 0;
    Uniquekey: string | null;
    BuildingName: string | null;
    BuildingAddress: string | null;
    CountryMasterId: number | null;
    CountryName: string;
    StateMasterId: number | null;
    StateName: string;
    DistrictMasterId: number | null;
    DistrictName: string;
    CityMasterId: number | null;
    CityName: string;
    PinCode: string | null;
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: string | null;
    WardNumberZone: string | null;
    TotalPlotAreaSqM: number | 0;
    YearOfOriginalConstruction: number | 0;
    ExistingBuildingType: string | null;
    NumberOfExistingFloors: number | 0;
    TotalNumberExistingFlatsUnits: number | 0;
    IdentificationLocation: string | null;
    LatitudeLongitude: string | null;
    ContactPersonName: string | null;
    ContactPersonMobile: string | null;
    ContactPersonEmail: string | null;
    PercentageMemberInFavor: number | 0;
    TypeOfLandTenure: string | null;
    PlotShape: string | null;
    Frontage: number | 0;
    PlotDepth: number | 0;
    RoadWidth: string | null;
    NumberOfExistingBuildingsWings: number | 0;
    NumberOfFloorsPerWing: number | 0;
    TotalBuildUpArea: number | 0;
    TotalCarpetArea: number | 0;
    TotalCommonArea: number | 0;
    IsLiftAvailable: boolean;
    IsFireSafetyProvisionPresent: boolean;
    IsPlotUnderLitigationStay: boolean;
    ConstructionType: string | null;
    Remarks: string | null;
    PhotoURL: string | null;
    IsConveyanceDeed: boolean;
    ClientRegistrationId: number | 0;
    CreatedById: number | 0;
    CreatedBy: string | "";
    CreatedDate: string | null;
    ModifiedById: number | 0;
    ModifiedBy: string | "";
    ModifiedDate: string | null;
    DeletedById: number | 0;
    DeletedBy: string | "";
    DeletedDate: string | null;
}

export interface AddUpdateProjectRedevelopmentData {
    ProjectRedevelopmentId: number | 0;
    Uniquekey: string | null;
    BuildingName: string | null;
    BuildingAddress: string | null;
    CountryMasterId: number | 0;
    StateMasterId: number | 0;
    DistrictMasterId: number | 0;
    CityMasterId: number | 0;
    PinCode: string | null;
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: string | null;
    WardNumberZone: string | null;
    TotalPlotAreaSqM: number | 0;
    YearOfOriginalConstruction: number | 0;
    ExistingBuildingType: string | null;
    NumberOfExistingFloors: number | 0;
    TotalNumberExistingFlatsUnits: number | 0;
    IdentificationLocation: string | null;
    LatitudeLongitude: string | null;
    ContactPersonName: string | null;
    ContactPersonMobile: string | null;
    ContactPersonEmail: string | null;
    PercentageMemberInFavor: number | 0;
    TypeOfLandTenure: string | null;
    PlotShape: string | null;
    Frontage: number | 0;
    PlotDepth: number | 0;
    RoadWidth: string | null;
    NumberOfExistingBuildingsWings: number | 0;
    NumberOfFloorsPerWing: number | 0;
    TotalBuildUpArea: number | 0;
    TotalCarpetArea: number | 0;
    TotalCommonArea: number | 0;
    IsLiftAvailable: boolean;
    IsFireSafetyProvisionPresent: boolean;
    IsPlotUnderLitigationStay: boolean;
    ConstructionType: string | null;
    Remarks: string | null;
    PhotoURL: string | null;
    RemovePhotoURL: string | "";
    IsConveyanceDeed: boolean;
}

export interface DeleteProjectRedevelopmentRequest {
    ProjectRedevelopmentId: number | 0;
    Uniquekey: string | null;
}

export type ProjectRedevelopmentListResponse = ApiResponse<ProjectRedevelopmentData[]>;
export type ProjectRedevelopmentSaveResponse = ApiResponse<ProjectRedevelopmentData[]>;
export type DeleteProjectRedevelopmentResponse = ApiResponse<number>;