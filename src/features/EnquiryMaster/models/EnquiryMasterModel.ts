import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationEnquiryMasterRequest {
    PageSize: number
    PageNumber: number
    EnquiryId?: number
    ProjectId?: number
    Name?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}
export interface EnquiryMasterData {
    EnquiryId: number | 0
    Uniquekey: string | null
    Name: string | ''
    ProjectId: number | 0
    EmailId: number | 0
    MobileNumber: number | 0
    OccupationType: string | null
    Accommodation: string | null
    Budget: string | null
    IsHomeLoan: boolean
    Requirement: string | null
    RequirementType: string | null
    AreaPreferred: number | 0
    PossessionType: string | null
    Source: string | null
    SubSource: string | null
    FinalStage: string | null
    FinalStageDetail: string | null
    NextFollowUpDate: number | 0
    EnquiryDate: number | 0
    Remark: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateEnquiryMasterRequest {
    EnquiryId: number | 0
    Uniquekey: string | null
    Name: string | ''
    ProjectId: number | 0
    EmailId: number | 0
    MobileNumber: number | 0
    OccupationType: string | null
    Accommodation: string | null
    Budget: string | null
    IsHomeLoan: boolean
    Requirement: string | null
    RequirementType: string | null
    AreaPreferred: number | 0
    PossessionType: string | null
    Source: string | null
    SubSource: string | null
    FinalStage: string | null
    FinalStageDetail: string | null
    NextFollowUpDate: number | 0
    EnquiryDate: number | 0
    Remark: string | null
}

export interface DeleteEnquiryMasterRequest {
    EnquiryId: number
    UniqueKey: string
    ProjectId: number
}

export type EnquiryMasterListResponse = ApiResponse<EnquiryMasterData[]>;
export type EnquiryMasterSaveResponse = ApiResponse<EnquiryMasterData[]>;
export type EnquiryMasterDeleteResponse = ApiResponse<number>;