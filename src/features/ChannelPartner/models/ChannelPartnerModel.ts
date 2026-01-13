import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationChannelPartnerRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ChannelPartnerId?: number
    Name?: string
    MobileNumber?: string
    ProjectId?:number
    CompanyName?: string
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerData {
    ChannelPartnerId: number
    Uniquekey: string
    Name: string
    CompanyName: string
    MobileNumber: string
    EmailId: string
    OfficeAddress: string
    AlternativeMobileNumber: string
    GSTNumber: string
    IsRERANumber:number | 0
    RERANumber: string
    PanNumber: string
    PanCardURL: string
    AadharCardURL: string
    AadharCardNumber: string
    VillageMasterId: string
    VillageName: string
    Speciality: string
    ProjectId: string
    ProjectName: string
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
    IsRERANumber:number | 0
    Speciality: string
    OfficeAddress: string
    ProjectId: string
    VillageMasterId: string


}

export interface DeleteChannelPartnerRequest {
    ChannelPartnerId: number
    Uniquekey: string
}

export type ChannelPartnerListResponse = ApiResponse<ChannelPartnerData[]>;
export type ChannelPartnerSaveResponse = ApiResponse<ChannelPartnerData[]>;
export type ChannelPartnerDeleteResponse = ApiResponse<number>;