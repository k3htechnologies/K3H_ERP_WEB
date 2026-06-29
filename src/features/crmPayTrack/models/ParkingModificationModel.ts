import type { ApiResponse } from "@/core/api/ApiResponse"
import type { ParkingData } from "@/features/parking/models/ParkingModel";

export interface FilterWithPaginationParkingModificationDetails {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
}

export interface ParkingModificationDetailsData {

    UniqueKey: string | null;
    BookingId: number;
    ProjectId: number;
    ParkingId: string;
    parkingData?: ParkingData[] | null;
    IsApproval: boolean;
    ApprovalStatus: string;
    VersionNumber: string;
    ProofOfDocumentURL: string;
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
    ProofOfDocumentURL?: File[] | null;
    RemoveProofOfDocumentURL?: string;
    ParkingData?: ParkingData[] | null;
}

export interface DeleteParkingModificationRequest {
    ParkingModificationRequestId: number;
    Uniquekey: string;
    BookingId: number;
    ProjectId: number;
}

export type ParkingModificationDetailsListResponse = ApiResponse<ParkingModificationDetailsData[]>;
export type ParkingModificationDetailsSaveReponse = ApiResponse<ParkingModificationDetailsData[]>;
export type ParkingModificationDetailsDeleteReponse = ApiResponse<number>;