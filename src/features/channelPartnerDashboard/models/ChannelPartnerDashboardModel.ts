import type { ApiResponse } from "@/core/api/ApiResponse"

export interface ChannelPartnerDashboardModel {
    Table0: Table0[]
    Table1: Table1[]
    Table2: Table2[]
    Table3: Table3[]
    Table4: Table4[]
    Table5: Table5[]
}

export interface Table0 {
    TotalChannelPartner: number | 0
    ActiveChannelPartner: number | 0
    ThisMonthAddedChannelPartner: number | 0
    MissingInfoChannelPartner: number | 0
}

export interface Table1 {
    FirmsType: string | null
    FirmsTypeFullName : string | null
    TotalCount: number | 0
}

export interface Table2 {
    Type: string | null
    TotalCount: number | 0
}

export interface Table3 {
    Name: string | null
    TotalChannelPartner: number |0
}

export interface Table4 {
    ChannelPartnerId: number | 0
    Name: string | null
    CompanyName: string | null
    SystemGeneratedCode: string | null
    Type: string | null
    MobileNumber: string
    CreatedDate: string | null
}

export interface Table5 {
    ChannelPartnerId: number | 0
    Name: string | null
    Date: string | null
    SystemGeneratedCode: string | null
    CompanyName: string | null
    Type: string | null
    MissingFields: string | null
}

export type ChannelPartnerDashboardResponse = ApiResponse<ChannelPartnerDashboardModel>;