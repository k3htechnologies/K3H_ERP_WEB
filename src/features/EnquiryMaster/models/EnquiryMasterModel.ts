import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEnquiryMasterRequest {
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

export interface EnquiryMasterData {
    EnquiryId: number | null
    Uniquekey: string | null
    ProjectId: number
    Name: string | null
    EmailId: string | null
    MobileNumber: string | null
    OccupationType: string | null
    Accommodation: string | null
    Budget: string | null
    IsHomeLoan: boolean
    ChannelPartnerId: number | null
    ChannelPartnerName: string,
    ChannelPartnerMobileNumber:number | null
    ProjectName: string | null
    Requirement: string | null
    RequirementType: string | null
    AreaPreferred: number
    PossessionType: string | null
    Source: string | null
    SubSource: string | null
    FinalStage: string | null
    FinalStageDetail: string | null
    NextFollowUpDate: string | null
    EnquiryDate: string | null
    Remark: string | null
    CreatedById?: number | 0
    CreatedBy?: string | null
    CreatedDate?: string | null
    ModifiedById?: number | 0
    ModifiedBy?: string
    ModifiedDate?: string | null
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

export interface AddUpdateEnquiryMasterRequest {
    EnquiryId: number | null
    Uniquekey: string | null
    ProjectId: number
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
    ChannelPartnerName:string | null
    ChannelPartnerMobileNumber:number | null
    ProjectName: string | null
    PossessionType?: string | null
    Source?: string | null
    SubSource?: string | null
    FinalStage?: string | null
    FinalStageDetail?: string | null
    NextFollowUpDate?: string | null
    EnquiryDate?: string | null
    Remark?: string | null
}

export interface DeleteEnquiryMasterRequest {
    EnquiryId: number
    Uniquekey: string
    ProjectId: number
}

export type EnquiryMasterListResponse = ApiResponse<EnquiryMasterData[]>
export type ChannelPartnerWithEnquiryListResponse=ApiResponse<ChannelPartnerWithEnquiryData[]>
export type EnquiryMasterSaveResponse = ApiResponse<EnquiryMasterData[]>
export type EnquiryMasterDeleteResponse = ApiResponse<number>