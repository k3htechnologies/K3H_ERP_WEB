import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterParkingRequest {
    ProjectId?: number
    Building?: string
    Wing?: string
    Floor?: string
    ParkingId?: number
    ParkingNumber?: string
    ParkingType?: string
    ParkingSubType?: string
    Dimensions?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF' | 'SAMPLE'
}

export interface ParkingData {
    // ========================= BASIC DETAILS =========================
    ParkingId?: number | null;
    Uniquekey?: string | null;
    ProjectId?: number | null;

    ParkingNumber?: string | null;
    ParkingCategory?: string | null;
    ParkingType?: string | null;
    ParkingSubType?: string | null;
    ParkingDimensions?: string | null;
    IsEVChargingAvailable: boolean;

    ParkingStatus?: 'Member' | "Available" | "Booked" | "Blocked" | "Hold";
    Remark?: string | null;

    // ========================= INVENTORY DETAILS =========================
    InventoryBuildingId: number;
    BuildingNumber?: string | null;

    InventoryFlatFloorBasementPodiumWingId: number;
    Wing?: string | null;

    InventoryFloorId: number;
    Floor: string;

    // ========================= PARKING OWNER =========================
    OwnerName?: string | null;
    BookingId?: number | null;

    // ========================= APPROVAL =========================
    IsApproval: boolean;
    ApprovalStatus?: string | null;

    // ========================= PARKING BOOKING DETAILS =========================
    ParkingBookingCreatedById?: number | null;
    ParkingBookingCreatedBy?: string | null;
    ParkingBookingCreatedDate?: string | null;

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface UpdateParkingRequest {
    ParkingId?: number | null;
    Uniquekey?: string | null;
    ProjectId?: number | null;

    ParkingNumber?: string | null;
    ParkingCategory?: string | null;
    ParkingType?: string | null;
    ParkingSubType?: string | null;
    ParkingDimensions?: string | null;

    IsEVChargingAvailable: boolean;
    ParkingStatus?: string | null;
    Remark?: string | null;

    // ================= INVENTORY DETAILS =================
    InventoryBuildingId: number;
    InventoryFlatFloorBasementPodiumWingId: number;
    InventoryFloorId: number;
}

export interface FilterWithPaginationParkingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    Building?: string
    Wing?: string
    Floor?: string
    ParkingId?: number
    ParkingNumber?: string
    ParkingType?: string
    ParkingSubType?: string
    Dimensions?: string
    DisplayParkingId?:string
    ParkingStatus?: string
    IsAcessOnlyApprovedParking?: boolean
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export type ParkingListResponse = ApiResponse<ParkingData[]>;
export type ParkingUpdateResponse = ApiResponse<ParkingData[]>;
