import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationChannelPartnerUniverseRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ChannelPartnerId?: number
    ChannelPartnerName?: string
    MobileNumber?: string
    CompanyName?: string
    Designation?: string
    FirmsType?: string
    Type?: string
    OfficeAddress?: string
    RERANumber?: string
    Status?: string
    ActiveDays?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerUniverseData {
    ChannelPartnerId: number
    SystemGeneratedCode: string
    Name: string
    DateOfBirth: string | null
    WebsiteURL: string
    CompanyName: string
    FirmsType: string
    Designation: string
    Type: string
    MobileNumber: string
    EmailId: string
    VerifiedNonVerified: string
    VillageName: string
    OfficeAddress: string
    RERANumber?: string
    PrimaryProjectPortfolio: string | ''
    SecondaryProjectPortfolio: string
    MicromarketProximity: string;
    Status: string
    ChannelPartnerCategory: string
    NoOfGrossWalkins: number | 0
    NoOfNetBooking: number | 0
    NetBookingRevenue: number | 0
    NoOfGrossWalkinsLifeTime: number | 0
    NoOfNetBookingLifeTime: number | 0
    NetBookingRevenueLifeTime: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
}


export interface FilterWithPaginationChannelPartnerUniverseAdditionalInformation {
    PageSize: number;
    PageNumber: number;
    ChannelPartnerUniverseAdditionalInformationId?: number;
    ChannelPartnerId?: number;
    SortBy?: string;
}


export interface ChannelPartnerUniverseAdditionalInformationData {
    ChannelPartnerUniverseAdditionalInformationId?: number;
    Uniquekey?: string;
    ChannelPartnerId: number;
    ReasonForInactivity: string;
    Remarks: string;
    AdditonalSupportRequired: string;
    AdditionalSupportProvided: string;
    IsAction: boolean;
    CreatedById: number | null;
    CreatedBy: string;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string;
    ModifiedDate: string | null;
}

export interface AddUpdateChannelPartnerUniverseAdditionalInformationRequest {
    ChannelPartnerUniverseAdditionalInformationId?: number;
    Uniquekey?: string;
    ChannelPartnerId: number;
    ReasonForInactivity: string;
    Remarks: string;
    AdditonalSupportRequired: string;
    AdditionalSupportProvided: string;
}

export interface DeleteChannelPartnerUniverseAdditionalInformationRequest {
  ChannelPartnerUniverseAdditionalInformationId: number;
  Uniquekey: string;
}


export type ChannelPartnerUniverseListResponse = ApiResponse<ChannelPartnerUniverseData[]>;
export type ChannelPartnerUniverseSaveResponse = ApiResponse<ChannelPartnerUniverseData[]>;

export type ChannelPartnerUniverseAdditionalInformationListResponse = ApiResponse<ChannelPartnerUniverseAdditionalInformationData[]>;
export type ChannelPartnerUniverseAdditionalInformationSaveResponse = ApiResponse<ChannelPartnerUniverseAdditionalInformationData[]>;
export type ChannelPartnerUniverseAdditionalInformationDeleteResponse = ApiResponse<string>;