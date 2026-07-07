import type { ApiResponse } from "@/core/api/ApiResponse";
import type { IBMOBMReportData } from "@/features/achievement/models/AchievementReportModel";
import type { BookingData } from "@/features/booking/models/BookingModel";
import type { EnquiryData } from "@/features/enquiry/models/EnquiryModel";

export interface FilterWithPaginationAopAchievementRequest {
    PageSize: number
    PageNumber: number
    Name?: string
    FilterType?: string
    FromDate?: string | null
    ToDate?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface FilterWithPaginationClickAchievementRequest {
    PageSize: number
    PageNumber: number
    ChannelPartnerId?: number
    Name?: string
    TabName?: string
    ColumnName?: string
    FilterType?: string
    FromDate?: string | null
    ToDate?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ChannelPartnerAOPAchievementData {
    ChannelPartnerId: number | 0
    Name: string | null
    WalkinsByCP: number | null
    TotalFreshVisits: number | null
    Revisits: number | null
    BookingByCP: number | null
    TotalRevenue: number | null
    TotalIBM: number | null
    IPC_IBM:number | null
    ICP_IBM:number | null
    RCP_IBM:number | null
    TotalOBM :number | null
    IPC_OBM:number | null
    ICP_OBM:number | null
    RCP_OBM:number | null
}

export type ChannelPartnerAOPListResponse = ApiResponse<ChannelPartnerAOPAchievementData[]>;
export type AOP_WalkinsRevisitReportListResponse = ApiResponse<EnquiryData[]>;
export type AOP_BookingReportListResponse = ApiResponse<BookingData[]>;
export type AOP_IBMOBMReportListResponse = ApiResponse<IBMOBMReportData[]>;