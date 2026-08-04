import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationChannelPartnerAOPRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    ChannelPartnerId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerAOPData {
    ChannelPartnerAOPId: number
    ChannelPartnerId: number

    AOPFromDate: string | null
    AOPToDate: string | null
    AOPDocumentURL: string
    AOPStatus: string
    
    NoOfIbm:number | 0
    NoOfObm:number | 0
    NoOfEnquiry: number | 0
    NoOfBooking: number | 0
    BrokeragePercentage: number | 0
    BrokerageAmount: number | 0
    PaidBrokerageAmount: number | 0

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null

}

export type ChannelPartnerAOPListResponse = ApiResponse<ChannelPartnerAOPData[]>;