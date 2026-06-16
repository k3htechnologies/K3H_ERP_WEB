import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationDailyCollectionReportModel {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number | null;
    ProjectName?: string | null;
    FilterType?: string
    FromDate?: string | null
    ToDate?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DailyCollectionReportData {
    ProjectId: number | null;
    ProjectName: string | null;
    Target: number | null;
    FTD: number | null;
    NewBooking: number | null;
    FTM: number | null;
    RegTarget: number | null;
    RegDoneFTD: number | null;
    RegDoneMTD: number | null;
    BalanceAgainstTarget: number | null;
}

export type DailyCollectionReportListResponse = ApiResponse<DailyCollectionReportData[]>;
