import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPerformanceReportRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    EmployeeId?: number
    EmployeeName?: string
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface PerformanceReportData {
    EmployeeId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    EmployeeName: string | null
    FromDate: string | null
    ToDate: string | null
    OverallTarget: number | null
    OverallAchieved: number | null
    OverallPerformance: string | null
    PerformanceWalkinsData: [] | null
    PerformanceBookingData: [] | null
    PerformanceRatioData: [] | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export type PerformanceReportListResponse = ApiResponse<PerformanceReportData[]>;
