import type { ApiResponse } from "@/core/api/ApiResponse"
import type { ParkingData } from "@/features/parking/models/ParkingModel";

export interface FilterWithPaginationParkingModificationDetails {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
}

export interface ParkingModificationDetailsData {

    Uniquekey: string | null;
    BookingId: number;
    ProjectId: number;
    ParkingId: string;
    parkingData?: ParkingData[] | null;
    IsApproval: boolean;
    ApprovalStatus: string;
    VersionNumber: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
    ParkingModificationRequestId: number;
}

export interface AddUpdateParkingModificationRequest {
    ParkingModificationRequestId: number;
    Uniquekey: string | null;
    BookingId: number;
    ProjectId: number;
    ParkingId: string;
    ParkingModificationDocumentURL?: File[] | null;
    RemoveParkingModificationDocumentURL?: string;
    ParkingData?: ParkingData[] | null;
    IsApproval: boolean;
    ApprovalStatus: string;
    VersionNumber: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
}

export type ParkingModificationDetailsListResponse = ApiResponse<ParkingModificationDetailsData[]>;
export type ParkingModificationDetailsSaveReponse = ApiResponse<ParkingModificationDetailsData[]>;