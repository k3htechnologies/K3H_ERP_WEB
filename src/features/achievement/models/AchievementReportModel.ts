import type { ApiResponse } from "@/core/api/ApiResponse"
import type { BookingData } from "@/features/booking/models/BookingModel"
import type { EnquiryData } from "@/features/enquiry/models/EnquiryModel"

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

export interface FilterWithPaginationClickAchievementRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    EmployeeId?: number
    ProjectName?: string
    TabName?: string
    ColumnName?: string
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

export interface IBMOBMReportData {
    ProjectName: string | null
    SystemGeneratedCode: string | null
    Name: string | null
    FirmsType: string | null
    Type:string | null
    Designation: string | null
    RERANumber: string | null
    GSTNumber: string | null
    Speciality: string | null
    OfficeAddress: string | null
    IBM_OBM: string | null
    SourcingRemark: string | null
    Support: string | null
    CreatedBy: string | null
    CreatedDate: string | null
    ModifiedBy: string | null
    ModifiedDate: string | null
}

export type ProjectAchievementListResponse = ApiResponse<ProjectAchievementData[]>;
export type AchievementClosingListResponse = ApiResponse<AchievementClosingData[]>;
export type AchievementSourcingListResponse = ApiResponse<AchievementSourcingData[]>;

export type WalkinsRevisitReportListResponse = ApiResponse<EnquiryData[]>;
export type BookingReportListResponse = ApiResponse<BookingData[]>;
export type IBMOBMReportListResponse = ApiResponse<IBMOBMReportData[]>;