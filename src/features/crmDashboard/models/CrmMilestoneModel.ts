import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCrmMilestoneRequest {
    ProjectId: 'number';
    FilterType: 'string';
    FromDate: 'string';
    ToDate: 'string';
    ExportType?: 'Excel' | 'PDF';
}

export interface CrmMilestoneCollectionData {
    PaymentScheduleName: string,
    Expected: number,
    Received: number,
    Pending: number
}

export interface CrmMilestoneSummary {
    Label: string,
    Agreement: number,
    GST: number,
    TDS: number
}

export type CrmMilestoneCollectionDataResponse = ApiResponse<CrmMilestoneCollectionData[]>;
export type CrmMilestoneSummaryResponse = ApiResponse<CrmMilestoneSummary[]>;

