import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationAchievementRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ProjectName?: string
    EmployeeName?: string
    FilterType?: string
    FromDate?: string | null
    ToDate?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProjectAchievementData {
    ProjectId: number | 0
    ProjectName: string | null

    TotalWalkins: number | null
    WalkinsByCP: number | null
    WalkinsDirect: number | null

    TotalFreshVisits: number | null
    Revisits: number | null
    BookingByCP: number | null

    BookingDirect: number | null
    TotalBooking: number | null
    TotalRevenue: number | null
    TotalIBM: number | null
    TotalOBM :number | null
}

export interface ProjectAchievementData {
    ProjectId: number | 0
    ProjectName: string | null

    TotalWalkins: number | null
    WalkinsByCP: number | null
    WalkinsDirect: number | null

    TotalFreshVisits: number | null
    Revisits: number | null
    BookingByCP: number | null

    BookingDirect: number | null
    TotalBooking: number | null
    TotalRevenue: number | null
}

export interface AchievementClosingData {
    EmployeeId: number | 0
    EmployeeName: string | null
    DesignationName: string | null

    TotalWalkins: number | null
    WalkinsByCP: number | null
    WalkinsDirect: number | null

    TotalFreshVisits: number | null
    Revisits: number | null
    BookingByCP: number | null

    BookingDirect: number | null
    TotalBooking: number | null
    TotalRevenue: number | null
}

export interface AchievementSourcingData {
    EmployeeId: number | 0
    EmployeeName: string | null
    DesignationName: string | null
    
    WalkinsByCP: number | null
    FreshVisits: number | null
    Revisits: number | null

    Bookings: number | null
    TotalRevenue: number | null
    TotalMeetings: number | null

    TotalOBMFreshVisits: number | null
    TotalOBMRevisits: number | null
    TotalIBM: number | null
}


export type ProjectAchievementListResponse = ApiResponse<ProjectAchievementData[]>;
export type AchievementClosingListResponse = ApiResponse<AchievementClosingData[]>;
export type AchievementSourcingListResponse = ApiResponse<AchievementSourcingData[]>;