import type { ApiResponse } from "@/core/api/ApiResponse";

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

export interface DeleteInventoryFlatRequest {
    ProjectId?: number
    InventoryBuildingId?: number
    InventoryFlatFloorBasementPodiumWingId?: number
    InventoryFloorId?: number
    InventoryFlatId?: number
}


export type InventoryListReponse = ApiResponse<InventoryData[]>
export type UpdateFlatResponse = ApiResponse<InventoryFlatData[]>
export type InventoryFlatDeleteResponse = ApiResponse<number>;

