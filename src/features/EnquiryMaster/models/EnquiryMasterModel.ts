import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationEnquiryMasterRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    Budget?: string;
    RequirementType?: string;
    Source?: string;
    FromDate?: string;   
    ToDate?: string;     
    MobileNumber?: string;
    Name?: string;
    Accommodation?: string;
    EmployeeId?: number;
    Stage?: string;
    TimeDimension?: string;
    EnquiryFollowUpDays?: string;
    FinalStage?: string;
    SortBy?: string;
    ExportType?: 'Excel' | 'PDF';
}

export interface EnquiryMasterData {
    EnquiryId: number;
    Uniquekey: string;
    ProjectId: number;
    Name: string;
    EmailId: string;
    MobileNumber: string;
    OccupationType: string | null;
    Accommodation: string | null;
    Budget: string | null;
    IsHomeLoan: boolean;
    Requirement: string | null;
    RequirementType: string | null;
    AreaPreferred: number;
    PossessionType: string | null;
    Source: string | null;
    SubSource: string | null;
    FinalStage: string | null;
    FinalStageDetail: string | null;
    NextFollowUpDate: string | null;
    EnquiryDate: string | null;
    Remark: string | null;
    CreatedById?: number;
    CreatedBy?: string;
    CreatedDate?: string | null;
    ModifiedById?: number;
    ModifiedBy?: string;
    ModifiedDate?: string | null;
}

export interface AddUpdateEnquiryMasterRequest {
    EnquiryId: number;
    Uniquekey: string;
    ProjectId: number;
    Name: string;
    EmailId: string;
    MobileNumber: string;
    OccupationType?: string | null;
    Accommodation?: string | null;
    Budget?: string | null;
    IsHomeLoan: boolean;
    Requirement?: string | null;
    RequirementType?: string | null;
    AreaPreferred?: number;
    PossessionType?: string | null;
    Source?: string | null;
    SubSource?: string | null;
    FinalStage?: string | null;
    FinalStageDetail?: string | null;
    NextFollowUpDate?: string | null;
    EnquiryDate?: string | null;
    Remark?: string | null;
}

export interface DeleteEnquiryMasterRequest {
    EnquiryId: number;
    Uniquekey: string;
    ProjectId: number;
}

export type EnquiryMasterListResponse = ApiResponse<EnquiryMasterData[]>;
export type EnquiryMasterSaveResponse = ApiResponse<EnquiryMasterData[]>;
export type EnquiryMasterDeleteResponse = ApiResponse<number>;