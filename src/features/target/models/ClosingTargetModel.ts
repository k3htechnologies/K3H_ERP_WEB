import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationClosingTargetRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    EmployeeId?: string
    EmployeeName?: string
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
    isCheckPermission?: boolean
}

export interface ClosingTargetData {
    Uniquekey: string;
    ProjectId: number;
    EmployeeId: number;
    EmployeeName: string;
    SalesTargetClosingId: number;
    WalkinsByCP: number;
    WalkinsDirect: number;
    FreshVisits: number;
    Revisits: number;
    BookingByCP: number;
    BookingDirect: number;
    FromDate: string;
    ToDate: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string | null;
}

export type ClosingTargetListResponse = ApiResponse<ClosingTargetData[]>;
