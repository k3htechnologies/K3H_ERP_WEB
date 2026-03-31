import type { ApiResponse } from "@/core/api/ApiResponse";
export interface SalesDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
    Table2: Table2[];
    Table3: Table3[];
}

export interface Table0 {
     SystemGeneratedCode: string | null
    ProjectName: string | null
    MobileNumber: string | null
    Name: string | null
    EnquiryDate: string | null
    EnquiryTimeIn: string | null
    SalesAdvisor: string | null
    SourcingManager: string | null
    CanTimeOut:boolean |false
    EnquiryId: number | 0
}

export interface Table1 {
    SystemGeneratedCode: string | null
    ProjectName: string | null
    MobileNumber: string | null
    Name: string | null
    EnquiryFollowUpDays: string | null
    FinalStage: string | null
    NextFollowUpDate: string | null
    SalesAdvisor: string | null
    SourcingManager: string | null
    CreatedDate: string | null
}

export interface Table2 {
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

export interface Table3 {
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

export interface EnquiryOutTimeData {
    EnquiryId: number | 0
    ProjectId: number | 0
}

export interface UpdateEnquiryOutTimeRequest {
    EnquiryId: number | 0
    ProjectId: number | 0
}

export type SalesDashboardDatasetResponse = ApiResponse<SalesDashboardDataset>;
export type EnquiryOutTimeSaveResponse = ApiResponse<EnquiryOutTimeData[]>;
