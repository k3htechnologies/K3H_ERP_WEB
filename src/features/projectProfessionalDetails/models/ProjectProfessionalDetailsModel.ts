import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectProfessionalDetails {
    PageNumber: number
    PageSize: number
    ProjectProfessionalDetailsId?: number
    ProjectId?: number
    ProfessionalType?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProjectProfessionalDetailsData {
    ProjectProfessionalDetailsId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    ProfessionalType: string | null
    RegistrationNumber: string | null
    Type: string | null
    CompanyName: string | null
    FirstName: string | null
    MiddelName: string | null
    LastName: string | null
    Designation: string | null
    UnitNumber: string | null
    BuldingName: string | null
    StreetName: string | null
    Locality: string | null
    LandMark: string | null
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
    PinCode: string | null
    PrimaryContactNumber: string | null
    AlternateContactNumber: string | null
    OfficeLandlineNumber: string | null
    EmailId: string | null
}

export interface AddUpdateProjectProfessionalDetails {
    ProjectProfessionalDetailsId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    ProfessionalType: string | null
    RegistrationNumber: string | null
    Type: string | null
    CompanyName: string | null
    FirstName: string | null
    MiddelName: string | null
    LastName: string | null
    Designation: string | null
    UnitNumber: string | null
    BuldingName: string | null
    StreetName: string | null
    Locality: string | null
    LandMark: string | null
    CountryMasterId: number | null;
    DistrictMasterId: number | null;
    StateMasterId: number | null;
    CityMasterId: number | null;
    VillageMasterId: number | null;
    PinCode: string | null
    PrimaryContactNumber: string | null
    AlternateContactNumber: string | null
    OfficeLandlineNumber: string | null
    EmailId: string | null
}

export interface DeleteProjectProfessionalDetailsRequest {
    ProjectProfessionalDetailsId: number
    ProjectId: number
    Uniquekey: string
}

export type ProjectProfessionalDetailsListResponse = ApiResponse<ProjectProfessionalDetailsData[]>;
export type ProjectProfessionalDetailsSaveResponse = ApiResponse<ProjectProfessionalDetailsData[]>;
export type ProjectProfessionalDetailsResponse = ApiResponse<number>;