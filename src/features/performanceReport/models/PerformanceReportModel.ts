import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPerformanceReportRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    EmployeeId?: number
    EmployeeName?: string
    FromDate?: string
    ToDate?: string
    ReportType?: string
    PeriodType?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PerformanceReportClosingData {
    EmployeeId: number | 0
    EmployeeName: string | null
    DesignationName: string | null

    WalkinsByCP: number | null
    ActualWalkinsByCP: number | null
    PerformanceWalkinsByCP: number | null

    WalkinsDirect: number | null
    ActualWalkinsDirect: number | null
    PerformanceWalkinsDirect: number | null

    FreshVisits: number | null
    ActualFreshVisits: number | null
    PerformanceFreshVisits: number | null

    Revisits: number | null
    ActualRevisits: number | null
    PerformanceRevisits: number | null

    BookingByCP: number | null
    ActualBookingByCP: number | null
    PerformanceBookingByCP: number | null

    BookingDirect: number | null
    ActualBookingDirect: number | null
    PerformanceBookingDirect: number | null
}

export interface PerformanceReportSourcingData {
    EmployeeId: number | 0
    EmployeeName: string | null
    DesignationName: string | null

    WalkinsByCP: number | null
    ActualWalkinsByCP: number | null
    PerformanceWalkinsByCP: number | null

    FreshVisits: number | null
    ActualFreshVisits: number | null
    PerformanceFreshVisits: number | null

    Revisits: number | null
    ActualRevisits: number | null
    PerformanceRevisits: number | null

    Bookings: number | null
    ActualBookings: number | null
    PerformanceBookings: number | null

    TotalOBM: number | null
    ActualTotalOBM: number | null
    PerformanceTotalOBM: number | null

    TotalOBMFreshVisits: number | null
    ActualTotalOBMFreshVisits: number | null
    PerformanceTotalOBMFreshVisits: number | null

    TotalOBMRevisits: number | null
    ActualTotalOBMRevisits: number | null
    PerformanceTotalOBMRevisits: number | null

    TotalIBM: number | null
    ActualTotalIBM: number | null
    PerformanceTotalIBM: number | null

    UniqueCPs: number | null
    ActualUniqueCPs: number | null
    PerformanceUniqueCPs: number | null

    ActiveCP: number | null
    ActualActiveCP: number | null
    PerformanceActiveCP: number | null

    NewCP: number | null
    ActualNewCP: number | null
    PerformanceNewCP: number | null
}

export type PerformanceReportClosingListResponse = ApiResponse<PerformanceReportClosingData[]>;
export type PerformanceReportSourcingListResponse = ApiResponse<PerformanceReportSourcingData[]>;
