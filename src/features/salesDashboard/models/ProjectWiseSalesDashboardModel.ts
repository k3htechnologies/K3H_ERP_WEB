import type { ApiResponse } from "@/core/api/ApiResponse";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";

export interface ProjectWiseSalesDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
    Table2: ProjectAchievementData[];
    Table3: Table3[];
}
export interface Table0 {
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

export interface Table1 {
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

    TotalMeetings: number | null
    ActualTotalMeetings: number | null
    PerformanceTotalMeetings: number | null

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

export interface Table3 {

    ChannelPartnerId: number | 0
    ChannelPartnerName: string | null
    SystemGeneratedCode: string | null
    WalkinsByCP: number | null
    Revisits: number | null
    TotalBooking: number | null
    TotalRevenue: number | null
}



export type ProjectWiseSalesDashboardDatasetResponse = ApiResponse<ProjectWiseSalesDashboardDataset>;
