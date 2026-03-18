import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationClosingTargetRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    IsSampleDownload?: boolean
    ProjectId?: number
    EmployeeId?: string
    EmployeeName?: string
    MonthYear?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ClosingTargetData {
    Uniquekey: string;
    ProjectId: number;
    EmployeeId: number;
    EmployeeName: string;
    
    DesignationName: string;
    SalesTargetClosingId: number;
    WalkinsByCP: number;
    WalkinsDirect: number;
    FreshVisits: number;
    Revisits: number;
    BookingByCP: number;
    BookingDirect: number;
    MonthYear: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string | null;
}

export type ClosingTargetListResponse = ApiResponse<ClosingTargetData[]>;
