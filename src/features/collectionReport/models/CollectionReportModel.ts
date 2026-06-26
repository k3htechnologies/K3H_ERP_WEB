import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProjectWiseRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number | null;
    ProjectName?: string | null;
    ExportType?: 'Excel' | 'PDF';
    SortBy?: string;
}

export interface FilterWithPaginationCollectionReportRequest {
    ProjectId?: number | null;
    ProjectName?: string | null;
    ExportType?: 'Excel' | 'PDF';
}

export interface CollectionReportData{
    ProjectId: number | null;
    ProjectName: string | null;
    Type: string | null;
    TotalUnit: number | null;
    TotalUnitRERACarpetAreaSqFt: number | null;
    RegistrationCompleted: number | null;
    RegistrationPending: number | null;
    BookingCount: number | null;
    TotalRERACarpetAreaSqFt: number | null;
    TotalAgreementValue: number | null;
    DueAmount: number | null;
    ReceivedAmount: number | null;
    OutstandingAmount: number | null;
    BalanceAmount: number | null;

}

export type ProjectWiseCollectionReportResponse = ApiResponse<CollectionReportData[]>;
export type CollectionReportResponse = ApiResponse<CollectionReportData[]>;