import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationSiteProgressConstructionRequest {
    ProjectId: number
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressConstructionData {
    ConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    Construction: string | null;
    Status: string | null;
    PlanStartDate: string | null;
    PlanEndDate: string | null;
    PlanDuration: number | null;
    ActualStartDate: string | null;
    ActualEndDate: string | null;
    ActualDuration: number | null;
    ActualDaysDifference: number | null;
    NextAction: string | null;
}

export interface FilterWithPaginationSiteProgressSubConstructionRequest {
    ProjectId: number
    InventoryBuildingId: number
    ConstructionId: number
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressSubConstructionData {
    SubConstructionId: number | null;
    ConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    SubConstruction: string | null;
    Status: string | null;
    PlanStartDate: string | null;
    PlanEndDate: string | null;
    PlanDuration: number | null;
    ActualStartDate: string | null;
    ActualEndDate: string | null;
    ActualDuration: number | null;
    ActualDaysDifference: number | null;
    NextAction: string | null;
}

export interface FilterWithPaginationSiteProgressWingConstructionRequest {
    ProjectId: number
    InventoryBuildingId: number
    ConstructionId: number
    SubConstructionId: number
    PageNumber?: number
    PageSize?: number
    SortBy?: string
    SearchTerm?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressWingConstructionData {
    WingConstructionId: number | null;
    ConstructionId: number | null;
    SubConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;

    Wing: string | null;
    Status: string | null;
    PlanStartDate: string | null;
    PlanEndDate: string | null;
    PlanDuration: number | null;
    ActualStartDate: string | null;
    ActualEndDate: string | null;
    ActualDuration: number | null;
    ActualDaysDifference: number | null;
    NextAction: string | null;
}


export interface FilterWithPaginationSiteProgressFloorConstructionRequest {
    ProjectId: number
    InventoryBuildingId: number
    ConstructionId: number
    SubConstructionId: number
    InventoryFlatFloorBasementPodiumWingId: number
    PageNumber?: number
    PageSize?: number
    SortBy?: string
    SearchTerm?: string
    ExportType?: 'Excel' | 'PDF'
}
export interface SiteProgressFloorConstructionData {
    FloorConstructionId: number | null;
    ConstructionId: number | null;
    SubConstructionId: number | null;
    WingConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;
    InventoryFloorId: number | null;

    Floor: string | null;
    Status: string | null;
    PlanStartDate: string | null;
    PlanEndDate: string | null;
    PlanDuration: number | null;
    ActualStartDate: string | null;
    ActualEndDate: string | null;
    ActualDuration: number | null;
    ActualDaysDifference: number | null;
    NextAction: string | null;
}

export interface FilterWithPaginationSiteProgressFlatConstructionRequest {
    ProjectId: number
    InventoryBuildingId: number
    ConstructionId: number
    SubConstructionId: number
    InventoryFlatFloorBasementPodiumWingId: number
    InventoryFloorId: number
    PageNumber?: number
    PageSize?: number
    SortBy?: string
    SearchTerm?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressFlatConstructionData {
    FlatConstructionId: number | null;
    ConstructionId: number | null;
    SubConstructionId: number | null;
    WingConstructionId: number | null;
    FloorConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;
    InventoryFloorId: number | null;
    InventoryFlatId: number | null;

    FlatNumber: string | null;
    Status: string | null;
    PlanStartDate: string | null;
    PlanEndDate: string | null;
    PlanDuration: number | null;
    ActualStartDate: string | null;
    ActualEndDate: string | null;
    ActualDuration: number | null;
    ActualDaysDifference: number | null;
    NextAction: string | null;
}

export interface FilterWithPaginationSiteProgressConstructionActivityRequest {
    ProjectId: number
    InventoryBuildingId: number
    ConstructionId: number
    SubConstructionId: number
    InventoryFlatFloorBasementPodiumWingId: number
    InventoryFloorId: number
    InventoryFlatId: number
    PageNumber?: number
    PageSize?: number
    SortBy?: string
    SearchTerm?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressConstructionActivityData {
    ConstructionActivityId: number | null;
    ConstructionId: number | null;
    SubConstructionId: number | null;
    ProjectId: number | null;
    InventoryBuildingId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;
    InventoryFloorId: number | null;
    InventoryFlatId: number | null;

    ActivityName: string | null;
}

export interface FilterWithPaginationSiteProgressConstructionSubActivityRequest {
    ProjectId: number
    ConstructionActivityId: number
    PageNumber?: number
    PageSize?: number
    SortBy?: string
    SearchTerm?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SiteProgressConstructionSubActivityData {
    ConstructionSubActivityId: number | null;
    ConstructionActivityId: number | null;
    ConstructionId: number | null;
    ProjectId: number | null;

    SubActivityName: string | null;
    IsCompleted: boolean | false;
}

export type SiteProgressConstructionListResponse = ApiResponse<SiteProgressConstructionData[]>;
export type SiteProgressSubConstructionListResponse = ApiResponse<SiteProgressSubConstructionData[]>;
export type SiteProgressWingConstructionListResponse = ApiResponse<SiteProgressWingConstructionData[]>;
export type SiteProgressFloorConstructionListResponse = ApiResponse<SiteProgressFloorConstructionData[]>;
export type SiteProgressFlatConstructionListResponse = ApiResponse<SiteProgressFlatConstructionData[]>;
export type SiteProgressConstructionActivityListResponse = ApiResponse<SiteProgressConstructionActivityData[]>;
export type SiteProgressConstructionSubActivityListResponse = ApiResponse<SiteProgressConstructionSubActivityData[]>;

