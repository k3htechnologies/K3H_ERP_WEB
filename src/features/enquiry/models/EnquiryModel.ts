import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEnquiryRequest {
    PageSize: number;
    PageNumber: number;
    IsCheckPermission?: boolean
    ProjectId?: number;
    EnquiryId?: number;
    SystemGeneratedCode?: string;
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
    TimeDimension?: string;
    EnquiryFollowUpDays?: string;
    FinalStage?: string;
    NotCheckFinalStage?: string;
    SortBy?: string;
    ExportType?: "Excel" | "PDF";
}


export interface EnquiryData {
    EnquiryId: number | null;
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

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
    
    ReferralProjectName: string | null;
    ReferralUnitNumber: string | null;
    ReferralProjectId: number | null;
    ReferralInventoryFlatId: number | null;
    ReferralUnitOwnerName: number | null;

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
    LoyaltyProjectId: number | null;
    LoyaltyInventoryFlatId: number | null;
    LoyaltyExistingProjectName: string | null;
    LoyaltyExistingUnitNumber: string | null;
    LoyaltyExistingUnitOwnerName: string | null;

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
    EmployeeReferenceName: string | null;
    EmployeeReferenceEmployeeId: number | null;
    EmployeeReferenceMobileNumber: string | null;

    ChannelPartnerId: number | null;
    ChannelPartnerCode: number | null;
    ChannelPartnerName: string | null;
    ChannelPartnerEmailId: string | null;
    ChannelPartnerMobileNumberCountryCode: string | null;
    ChannelPartnerMobileNumber: number | null;
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
}


export interface ChannelPartnerWithEnquiryData {
    PageSize: number
    PageNumber: number
    ChannelPartnerId: number | null
    ProjectId: number | null
    Budget: string | null
    RequirementType: string | null
    Source: string | null
    FromDate: string | null
    ToDate: string | null
    MobileNumber: number | null
    Name: string | null
    Accommodation: string | null
    Stage: string | null
    TimeDimension: string | null
}

export interface AddUpdateEnquiryRequest {
    EnquiryId: number | null;
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

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
    ReferralProjectId: number | null;
    ReferralInventoryFlatId: number | null;

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
    LoyaltyProjectId: number | null;
    LoyaltyInventoryFlatId: number | null;

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
    EmployeeReferenceEmployeeId: number | null;

    ChannelPartnerTeamMemberId?: number | null;
    ChannelPartnerTeamMemberName?: string | null;
    ChannelPartnerTeamMemberMobileNumber?: string | null;
    ChannelPartnerTeamMemberMobileNumberCountryCode?: string | null;
    ChannelPartnerTeamMemberEmailId?:string |null;

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

    OTP?: string | null;
}


export interface DeleteEnquiryRequest {
    EnquiryId: number
    Uniquekey: string
    ProjectId: number
}

export type EnquiryListResponse = ApiResponse<EnquiryData[]>
export type ChannelPartnerWithEnquiryListResponse = ApiResponse<ChannelPartnerWithEnquiryData[]>
export type EnquirySaveResponse = ApiResponse<EnquiryData[]>
export type EnquiryDeleteResponse = ApiResponse<number>