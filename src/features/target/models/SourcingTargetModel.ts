import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationSourcingTargetRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    IsSampleDownload?: boolean
    ProjectId?: number
    EmployeeId?: string
    EmployeeName?: string
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SourcingTargetData {
    Uniquekey: string;
    ProjectId: number;
    EmployeeId: number;
    EmployeeName: string;
    DesignationName: string;

    WalkinsByCP: number;
    FreshVisits: number;
    Revisits: number;
    Bookings: number;

    TotalMeetings: number;
    TotalOBM: number;
    TotalOBMFreshVisits: number;
    TotalOBMRevisits: number;
    TotalIBM: number;

    UniqueCPs: number;
    ActiveCP: number;
    NewCP: number;

    FromDate: string;
    ToDate: string;

    CreatedBy: string;
    CreatedDate: string;
}
export type SourcingTargetListResponse = ApiResponse<SourcingTargetData[]>;