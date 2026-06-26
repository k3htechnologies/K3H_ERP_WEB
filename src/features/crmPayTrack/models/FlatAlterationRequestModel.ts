import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationFlatAlterationRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
}

export interface FlatAlterationRequestData {
    FlatAlterationRequestId: number;
    UniqueKey: string;
    BookingId: number;
    ProjectId: number;
    FlatAlterationRemark: string;
    ProofOfDocumentURL: string;
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

export interface AddUpdateFlatAlterationRequest {
    FlatAlterationRequestId: number;
    UniqueKey: string;
    BookingId: number;
    ProjectId: number;
    FlatAlterationRemark: string;
    ProofOfDocumentURL?: File[] | null;
    RemoveProofOfDocumentURL?: string;
}

export interface DeleteFlatAlterationRequest {
    FlatAlterationRequestId: number;
    Uniquekey: string;
    BookingId: number;
    ProjectId: number;
}

export type FlatAlterationRequestListResponse = ApiResponse<FlatAlterationRequestData[]>;
export type FlatAlterationRequestSaveReponse = ApiResponse<FlatAlterationRequestData[]>;
export type FlatAlterationRequestDeleteReponse = ApiResponse<number>;