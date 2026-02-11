import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationChannelPartnerRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ChannelPartnerId?: number
    ChannelPartnerName?: string
    MobileNumber?: string
    CompanyName?: string
    FirmsType?: string
    Type?: string
    OfficeAddress?: string
    GSTNumber?: string
    RERANumber?: string
    PanNumber?: string
    AadharCardNumber?: string
    Speciality?: string
    CityName?: string;
    VillageName?: string;
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerData {
    ChannelPartnerId: number
    Uniquekey: string
    SystemGeneratedCode : string
    Name: string
    CompanyName: string

    FirmsType: string
    Designation: string
    Type: string

    MobileNumber: string
    EmailId: string
    OfficeAddress: string
    AlternativeMobileNumber: string
    GSTNumber: string
    IsRERANumber: number | 0
    RERANumber: string
    PanNumber: string
    PanCardURL: string
    AadharCardURL: string
    AadharCardNumber: string

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

    Speciality: string
    
    Status: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null

    ChannelPartnerTeamData: ChannelPartnerTeamData[];
}

export interface ChannelPartnerTeamData {
    ChannelPartnerId: number
    Uniquekey: string
    Name: string
    CompanyName: string
    FirmsType: string
    Designation: string
    Type: string
    MobileNumber: string
    EmailId: string
    OfficeAddress: string
    AlternativeMobileNumber: string
    GSTNumber: string
    IsRERANumber: number | 0
    RERANumber: string
    PanNumber: string
    PanCardURL: string
    AadharCardURL: string
    AadharCardNumber: string

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

    Speciality: string
    
    Status: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateChannelPartnerRequest {
    ChannelPartnerId?: number | 0
    Uniquekey: string | null
    Name: string
    CompanyName: string
    FirmsType: string
    Designation: string
    Type: string
    CompanyType: string
    MobileNumber: string
    AlternativeMobileNumber: string
    EmailId: string
    AadharCardNumber: string
    PanNumber: string
    PanCardURL: File[] | null
    AadharCardURL: File[] | null
    RemovePanCardURL: string | ''
    RemoveAadharCardURL: string | ''
    GSTNumber: string
    RERANumber: string
    IsRERANumber: number | 0
    Speciality: string
    OfficeAddress: string
    CountryMasterId: number | null;
    DistrictMasterId: number | null;
    StateMasterId: number | null;
    CityMasterId: number | null;
    VillageMasterId: number | null;
}

export interface DeleteChannelPartnerRequest {
    ChannelPartnerId: number
    Uniquekey: string
}

export interface FilterWithPaginationChannelPartnerCompanyRequest {
    PageSize: number
    PageNumber: number
    CompanyName?: string
}

export type ChannelPartnerListResponse = ApiResponse<ChannelPartnerData[]>;
export type ChannelPartnerSaveResponse = ApiResponse<ChannelPartnerData[]>;
export type ChannelPartnerDeleteResponse = ApiResponse<number>;