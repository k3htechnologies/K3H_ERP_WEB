import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationModuleApprovalReport {
    PageSize: number;
    PageNumber: number;
    ModuleApprovalReportId?: number
    SortBy?: string;
    ExportType?: "Excel" | "PDF";
}

export interface ModuleApprovalReportData {
    ModuleApprovalReportId: number | 0
    Uniquekey: string | null;
    Name: string | null
    Department: string | null
    MobileNumber: string | null
    NoOfApproval: string | null
}

export type ModuleApprovalReportListResponse = ApiResponse<ModuleApprovalReportData[]>;