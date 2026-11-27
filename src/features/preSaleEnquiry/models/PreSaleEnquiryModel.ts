import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPreSaleEnquiryRequest {
    PageSize: number;
    PageNumber: number;
    IsCheckPermission?: boolean
    ProjectId?: number;
    PreSaleEnquiryId?: number;
    ProjectName?: string
    Name?: string;
    MobileNumberCountryCode?: string;
    MobileNumber?: string;
    Budget?: string;
    RequirementType?: string;
    Source?: string;
    SubSource?: string;
    SubSubSource?: string;
    ChannelPartnerMobileNumber?: string;
    Nationality?: string;
    CurrentLocation?: string;
    CustomerClassification?: string;
    Ethnicity?: string;
    SalesAdvisor?: string;
    SourcingManager?: string;
    EmployeeId?: number;
    FromDate?: string | '';
    ToDate?: string | '';
    Accommodation?: string;
    Stage?: string;
    FinalStage?: string;
    NotCheckFinalStage?: string;
    SortBy?: string;
    ExportType?: "Excel" | "PDF";
}

export interface PreSaleEnquiryData {
    PreSaleEnquiryId: number | 0
    Uniquekey: string | null;
    SystemGeneratedCode: string | null;
    ProjectId: number;
    ProjectName: string | null;
    Name: string | null;
    EmailId: string | null;
    MobileNumberCountryCode: string | null;
    MobileNumber: string | null;
    DateOfBirth: string | null;

    CurrentLocation: string | null;
    VillageMasterId: string | null;
    VillageName: string | null;
    OccupationType: string | null;
    Accommodation: string | null;

    Budget: string | null;
    Requirement: string | null;
    RequirementType: string | null;

    AreaPreferred: number;
    PossessionType: string | null;
    Source: string | null;
    SubSource: string | null;
    SubSubSource: string | null;

    ReferralProjectName: string | null;
    ReferralUnitNumber: string | null;
    ReferralProjectId: number | null;
    ReferralInventoryFlatId: number | null;
    ReferralUnitOwnerName: string | null;

    LoyaltyProjectId: number | null;
    LoyaltyInventoryFlatId: number | null;
    LoyaltyExistingProjectName: string | null;
    LoyaltyExistingUnitNumber: string | null;
    LoyaltyExistingUnitOwnerName: string | null;

    EmployeeReferenceName: string | null;
    EmployeeReferenceEmployeeId: number | null;
    EmployeeReferenceMobileNumber: string | null;

    ChannelPartnerId: number | null;
    ChannelPartnerCode: string | null;
    ChannelPartnerName: string | null;
    ChannelPartnerEmailId: string | null;
    ChannelPartnerMobileNumberCountryCode: string | null;
    ChannelPartnerMobileNumber: string | null;
    ChannelPartnerCompany: string | null;
    ChannelPartnerFirmsType: string | null;
    ChannelPartnerDesignation: string | null;
    ChannelPartnerType: string | null;
    ChannelPartnerTeamMemberId: number;
    ChannelPartnerTeamMemberName: string | null;
    ChannelPartnerTeamMemberMobileNumber: string | null;
    ChannelPartnerTeamMemberMobileNumberCountryCode: string | null;
    ChannelPartnerTeamMemberEmailId: string | null;

    FinalStage: string | null;
    FinalStageDetail: string | null;
    NextFollowUpDate: string | null;
    EnquiryDate: string | null;
    Nationality: string | null;
    CountryOfResidence: string | null;
    CityOfResidence: string | null;

    DesiredFloorBand: string | null;
    CustomerClassification: string | null;
    SourceOfFunding: string | null;
    Ethnicity: string | null;
    Timeline: string | null;

    SalesAdvisorId: number | null;
    SalesAdvisor: string | null;
    SourcingManagerId: number | null;
    SourcingManager: string | null;

    EnquiryTimeIn: string | null;
    EnquiryTimeOut: string | null;
    Remark: string | null;

    CreatedById?: number;
    CreatedBy?: string | null;
    CreatedDate?: string | null;
    ModifiedById?: number;
    ModifiedBy?: string | null;
    ModifiedDate?: string | null;
    EnquiryTimeInDisplay: string | null;
    EnquiryTimeOutDisplay: string | null;
    IsSend: boolean;
}

export interface AddUpdatePreSaleEnquiryRequest {
    PreSaleEnquiryId: number | 0
    Uniquekey: string | null;
    ProjectId: number;
    EnquiryTimeOut?: string | null;
    Name: string | null;
    MobileNumberCountryCode: string | null;
    MobileNumber: string | null;
    EmailId: string | null;
    DateOfBirth: string | null;

    Accommodation?: string | null;
    OccupationType?: string | null;
    Source?: string | null;
    SubSource?: string | null;
    SubSubSource?: string | null;
    ReferralProjectId: number | null;
    ReferralInventoryFlatId: number | null;

    LoyaltyProjectId: number | null;
    LoyaltyInventoryFlatId: number | null;
    EmployeeReferenceEmployeeId: number | null;

    ChannelPartnerTeamMemberId?: number | null;
    ChannelPartnerTeamMemberName?: string | null;
    ChannelPartnerTeamMemberMobileNumber?: string | null;
    ChannelPartnerTeamMemberMobileNumberCountryCode?: string | null;
    ChannelPartnerTeamMemberEmailId?: string | null;

    Nationality?: string | null;
    CountryOfResidence?: string | null;
    CityOfResidence?: string | null;
    CurrentLocation?: string | null;
    PossessionType?: string | null;
    AreaPreferred?: number | null;
    DesiredFloorBand?: string | null;
    Budget?: string | null;

    Requirement?: string | null;
    RequirementType?: string | null;
    CustomerClassification?: string | null;
    SourceOfFunding?: string | null;
    Ethnicity?: string | null;
    Timeline?: string | null;
    FinalStage?: string | null;
    FinalStageDetail?: string | null;
    EnquiryDate?: string | null;
    NextFollowUpDate?: string | null;

    SalesAdvisorId?: number | null;
    SourcingManagerId?: number | null;
    EnquiryTimeIn?: string | null;
    Remark?: string | null;
    VillageMasterId?: string | null;
    IsSend?: boolean;
}

export interface DeletePreSaleEnquiryRequest {
    PreSaleEnquiryId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
}

export type PreSaleEnquiryListResponse = ApiResponse<PreSaleEnquiryData[]>;
export type PreSaleEnquirySaveResponse = ApiResponse<PreSaleEnquiryData[]>;
export type PreSaleEnquiryDeleteResponse = ApiResponse<number>;