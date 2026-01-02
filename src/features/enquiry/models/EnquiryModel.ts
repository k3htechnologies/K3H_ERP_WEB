import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEnquiryRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    EnquiryId?: number
    Budget?: string
    RequirementType?: string
    Source?: string
    FromDate?: string
    ToDate?: string
    MobileNumber?: string
    Name?: string
    Accommodation?: string
    EmployeeId?: number
    Stage?: string
    TimeDimension?: string
    EnquiryFollowUpDays?: string
    FinalStage?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface EnquiryData {
    EnquiryId: number | null
    Uniquekey: string | null
    ProjectId: number
    SalesAdvisorId:number | null
    SalesAdvisor:string | null
    SourcingManagerId:number | null
    SourcingManager:string | null
    PresalesExecutiveId:number | null
    PresalesExecutive:string | null
    Name: string | null
    EmailId: string | null
    MobileNumber: string | null
    OccupationType: string | null
    Accommodation: string | null
    Budget: string | null
    IsHomeLoan: boolean
    ChannelPartnerId: number | null
    ChannelPartnerName: string,
    ChannelPartnerMobileNumber: number | null
    ProjectName: string | null
    Requirement: string | null
    RequirementType: string | null
    AreaPreferred: number
    PossessionType: string | null
    Source: string | null
    Age: string | null
    SubSource: string | null
    FinalStage: string | null
    FinalStageDetail: string | null
    NextFollowUpDate: string | null
    EnquiryDate: string | null
    EmployeeName: string | null
    Nationality: string | null
    DesiredFloorBand: string | null
    NeighborhoodPlacesInterestedIn: string | null
    CustomerClassification: string | null
    SourceOfFunding: string | null
    CountryOfResidence:string | null
    CityOfResidence:string | null
    Ethnicity: string | null
    EnquiryTimeIn: string | null
    EnquiryTimeOut: string | null
    Remark: string | null
    CreatedById?: number | 0
    CreatedBy?: string | null
    CreatedDate?: string | null
    ModifiedById?: number | 0
    ModifiedBy?: string
    ModifiedDate?: string | null
}

export interface AddUpdateEnquiryRequest {
    EnquiryId: number | null
    Uniquekey: string | null
    ProjectId: number
    EmployeeId: number
    SalesAdvisorId:number | null
    SourcingManagerId:number | null
    PresalesExecutiveId:number | null
    Name: string | null
    EmailId: string | null
    MobileNumber: string | null
    OccupationType?: string | null
    Accommodation?: string | null
    Budget?: string | null
    IsHomeLoan: boolean | false
    Requirement?: string | null
    RequirementType?: string | null
    AreaPreferred?: number | null
    ChannelPartnerId: number | null
    ChannelPartnerName: string | null
    ChannelPartnerMobileNumber: number | null
    ProjectName: string | null
    PossessionType?: string | null
    Source?: string | null
    SubSource?: string | null
    FinalStage?: string | null
    FinalStageDetail?: string | null
    NextFollowUpDate?: string | null
    EnquiryDate?: string | null
    Nationality?: string | null
    CountryOfResidence?: string | null
    CityOfResidence?: string | null
    DesiredFloorBand?: string | null
    Age?: string | null
    NeighborhoodPlacesInterestedIn?: string | null
    CustomerClassification?: string | null
    SourceOfFunding?: string | null
    Ethnicity?: string | null
    EnquiryTimeIn?: string | null
    EnquiryTimeOut?: string | null
    Remark?: string | null
}

export interface DeleteEnquiryRequest {
    EnquiryId: number
    Uniquekey: string
    ProjectId: number
}

export type EnquiryListResponse = ApiResponse<EnquiryData[]>
export type EnquirySaveResponse = ApiResponse<EnquiryData[]>
export type EnquiryDeleteResponse = ApiResponse<number>