import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInventoryParkingOverallReportRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number | null;
    ProjectName?: string | null;
    ExportType?: 'Excel' | 'PDF' | 'SAMPLE';
    SortBy?: string;
}

export interface InventoryParkingOverallReportData {
    ProjectId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;
    ProjectName: string | null;
    BuildingNumber: string | null;
    Wing: string | null;

    AllotedReraArea: number | null;
    BookedReraArea: number | null;
    HoldReraArea: number | null;
    AvailableReraArea: number | null;
    BlockReraArea: number | null;
    TotalReraArea: number | null;

    AllotedUnit: number | null;
    BookedUnit: number | null;
    AvailableUnit: number | null;
    HoldUnit: number | null;
    BlockUnit: number | null;
    TotalUnit: number | null;

    MemberParking: number | null;
    SalesParking: number | null;
    TotalParking: number | null;
}

export type InventoryParkingOverallReportResponse = ApiResponse<InventoryParkingOverallReportData[]>;


