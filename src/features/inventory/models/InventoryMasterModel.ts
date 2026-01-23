import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterProjectInventoryExistsRequest {
    ProjectId: number
}

export interface FilterInventoryRequest {
    ProjectId: number
    ExportType?: 'Excel' | 'PDF'
}

export interface InventoryData {
    InventoryBuildingId: number;
    Uniquekey: string;
    ProjectId: number;
    BuildingNumber: string;
    NoOfBasement: number;
    NoOfPodium: number;
    NoOfWings: number;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: Date;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: null;
    InventoryFlatFloorBasementPodiumWingData: InventoryFlatFloorBasementPodiumWingData[];
}

export interface InventoryFlatFloorBasementPodiumWingData {
    InventoryFlatFloorBasementPodiumWingId: number;
    Uniquekey: string;
    InventoryBuildingId: number;
    MaxNoOfFlatPerFloor: number;
    NoOfFloorExcludingPodium: number;
    Wing: string;
    IsApproval: boolean;
    ApprovalStatus: string;
    InventoryFloorData: InventoryFloorData[];
}

export interface InventoryFloorData {
    InventoryFloorId: number;
    Uniquekey: string;
    InventoryBuildingId: number;
    InventoryFlatFloorBasementPodiumWingId: number;
    Floor: string;
    SlabHeight: number;
    ParkingCount: number;
    InventoryFlatData: InventoryFlatData[];
}

export interface InventoryFlatData {
    InventoryFlatId: number;
    Uniquekey: string;
    InventoryBuildingId: number;
    BuildingNumber: string;
    InventoryFlatFloorBasementPodiumWingId: number;
    Wing: string;
    InventoryFloorId: number;
    Floor: string;
    Flat: string;
    RERACarpetAreaSqFt: number;
    FlatType: string;
    FlatConfiguration: string;
    FlatStatus: 'Alloted' | "Available" | "Booked" | "Blocked" | "Hold";
    FlatFacing: string;
    InventoryFlatSpecificationData: InventoryFlatSpecificationData[];
    OwnerName: string;
    BookingId: number;
    BookingCreatedById: number;
    BookingCreatedBy: string;
    BookingCreatedDate: Date | null;
}

export interface InventoryFlatSpecificationData {
    InventoryFlatSpecificationId: number;
    Uniquekey: string;
    InventoryBuildingId: number;
    InventoryFlatFloorBasementPodiumWingId: number;
    InventoryFloorId: number;
    InventoryFlatId: number;
    FlatLayout: string;
    FlatLayoutAreaSqFt: number;
    FlatLayoutLengthSqFt: number;
    FlatLayoutWidthSqFt: number;
    Note: string;
}

export interface AddInventoryFlatSpecificationData {
    InventoryFlatSpecificationId: number;
    Uniquekey: string;
    FlatLayout: string;
    FlatLayoutAreaSqFt: number;
    FlatLayoutLengthSqFt: number;
    FlatLayoutWidthSqFt: number;
    Note: string;
}

export interface AddInventoryRequest {
    ProjectId?: number
    InventoryJSON?: string
}

export interface DeleteInventoryRequest {
    ProjectId?: number
}

export interface UpdateInventoryFloorRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFoorId?: number
    SlabHeight?: number
}

export interface UpdateInventoryFlatRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFlatId?: number
    Flat?: string
    FlatType?: string
    RERACarpetAreaSqFt?: number
    FlatConfiguration?: string
    FlatStatus?: string
    FlatFacing?: string

    InventoryFlatSpecificationJSON?: string
}

export interface UpdateInventoryWingRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    Wing?: string
    OldWing?: string
}

export interface DeleteInventoryBuildingRequest {
    ProjectId?: number
    InventoryBuildingId?: number
}

export interface DeleteInventoryWingRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
}

export interface DeleteInventoryFloorRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFloorId?: number
}

export interface DeleteInventoryFlatRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFloorId?: number
    InventoryFlatId?: number
}

export interface AddInventoryBuildingRequest {
    ProjectId?: number
    InventoryJSON?: string
}

export interface AddInventoryWingRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    MaxNoOfFlatPerFloor?: number
    NoOfFloorExcludingPodium?: number
    Wing?: string
}

export interface AddInventoryFloorRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
}

export interface AddInventoryFlatRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFloorId?: number
    Flat?: string
    FlatType?: string
    RERACarpetAreaSqFt?: number
    FlatConfiguration?: string
    FlatStatus?: string
    FlatFacing?: string
    InventoryFlatSpecificationJSON?: string
}

export interface AddUpdateInventoryFloorParkingCountRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFloorId?: number
    ParkingCount?: number
}

export interface FilterPaginatedFlatsRequest {
    PageSize: number
    PageNumber: number
    ProjectId: number
    BuildingNumber?: string
    Wing?: string
    Floor?: string
    Flat?: string
    RERACarpetAreaSqFt: number
    FlatType?: string
    FlatConfiguration?: string
    FlatFacing?: string
}

export type ProjectInventoryExistsResponse = ApiResponse<boolean>;
export type InventoryListReponse = ApiResponse<InventoryData[]>
export type AddInventoryResponse = ApiResponse<InventoryData[]>
export type InventoryDeleteResponse = ApiResponse<number>;
export type UpdateInventoryFloorResponse = ApiResponse<InventoryFloorData[]>
export type UpdateInventoryFlatResponse = ApiResponse<InventoryFlatData[]>
export type UpdateInventoryWingResponse = ApiResponse<InventoryData[]>
export type InventoryBuildingDeleteResponse = ApiResponse<number>;
export type InventoryWingDeleteResponse = ApiResponse<number>;
export type InventoryFloorDeleteResponse = ApiResponse<number>;
export type InventoryFlatDeleteResponse = ApiResponse<number>;
export type AddInventoryBuildingResponse = ApiResponse<InventoryData[]>
export type AddInventoryWingResponse = ApiResponse<InventoryData[]>
export type AddInventoryFloorResponse = ApiResponse<InventoryData[]>
export type AddInventoryFlatResponse = ApiResponse<InventoryFlatData[]>
export type AddUpdateInventoryFloorParkingCountResponse = ApiResponse<string>;
export type FilterPaginatedFlatsResponse = ApiResponse<InventoryFlatData[]>;

