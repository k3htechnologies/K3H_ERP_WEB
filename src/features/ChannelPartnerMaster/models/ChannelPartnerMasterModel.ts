import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationChannelPartnerMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ChannelPartnerId?: number
    Name?: string
    MobileNumber?: string
    CompanyName?: string
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerMasterData {
    ChannelPartnerId: number
    Uniquekey: string
    Name: string
    CompanyName: string
    MobileNumber: string
    EmailId: string
    OfficeAddress: string
    AlternativeMobileNumber: string
    GSTNumber: string
    RERANumber: string
    PanNumber: string
    PanCardURL: string
    AdharCardURL: string
    AdharCardNumber: string
    Speciality: string
    ProjectId: string
    ProjectName: string
    DesignationMasterId:string
    DesignationName:string
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

export interface AddUpdateChannelPartnerMasterRequest {
    ChannelPartnerId?: number | 0
    Uniquekey: string | null
    Name: string
    CompanyName: string
    MobileNumber: string
    AlternativeMobileNumber: string
    EmailId: string
    AdharCardNumber: string
    PanNumber: string
    PanCardURL: File[] | null
    AdharCardURL: File[] | null
    RemovePanCardURL: string | ''
    RemoveAadharCardURL: string | ''
    GSTNumber: string
    RERANumber: string
    Speciality: string
    OfficeAddress: string
    DesignationMasterId:string
    DesignationName:string
    ProjectId: string
    ProjectName: string


}

export interface DeleteChannelPartnerMasterRequest {
    ChannelPartnerId: number
    Uniquekey: string
}

export type ChannelPartnerMasterListResponse = ApiResponse<ChannelPartnerMasterData[]>;
export type ChannelPartnerMasterSaveResponse = ApiResponse<ChannelPartnerMasterData[]>;
export type ChannelPartnerMasterDeleteResponse = ApiResponse<number>;