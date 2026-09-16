import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationVendorWiseMaterialCountReport {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    VendorName?: string;
    FromDate?: string;
    ToDate?: string;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface VendorWiseMaterialCountReportData {
    ProjectId: number | 0;
    VendorName: string | null;
    FromDate: string | null;
    ToDate: string | null;
}

export interface FilterWithPaginationMaterialAndVendorReport {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    VendorId?: number;
    MaterialName?: string;
    SubMaterialName?: string;
    FromDate?: string;
    ToDate?: string;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface MaterialAndVendorReportData {
    ProjectId: number | 0;
    VendorId: number | 0;
    MaterialName: string | null;
    SubMaterialName: string | null;
    FromDate: string | null;
    ToDate: string | null;
}

export interface FilterWithPaginationMaterialRequisitionReport {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    MaterialName?: string;
    SubMaterialName?: string;
    FromDate?: string;
    ToDate?: string;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface MaterialRequisitionReportData {
    ProjectId: number | 0;
    MaterialName: string | null;
    SubMaterialName: string | null;
    FromDate: string | null;
    ToDate: string | null;
}

export interface FilterWithPaginationMaterialPurchaseReport {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    SystemGeneratedCode?: string;
    FromDate?: string;
    ToDate?: string;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface MaterialPurchaseReportData {
    ProjectId: number | 0;
    SystemGeneratedCode: string | null;
    FromDate: string | null;
    ToDate: string | null;
}

export type VendorWiseMaterialCountReportListRespone = ApiResponse<VendorWiseMaterialCountReportData[]>;
export type MaterialAndVendorReportListResponse = ApiResponse<MaterialAndVendorReportData[]>;
export type MaterialRequisitionReportListResponse = ApiResponse<MaterialRequisitionReportData[]>;
export type MaterialPurchaseReportListResponse = ApiResponse<MaterialPurchaseReportData[]>;