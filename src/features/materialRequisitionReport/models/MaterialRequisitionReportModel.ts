import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationMaterialRequisitionReport {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    VendorName?: string;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface MaterialRequisitionReportData {
    ProjectId: number | null;
}

export type MaterialRequisitionReportListResponse = ApiResponse<MaterialRequisitionReportData[]>;