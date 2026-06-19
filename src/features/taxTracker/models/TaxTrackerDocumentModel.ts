import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationTaxTrackerDocumentRequest {
    TaxTrackerId: number | 0;
    TaxTrackerDocumentId: number | 0;
    ExportType?: 'Excel' | 'PDF'
}

export interface TaxTrackerDocumentData {
    TaxTrackerDocumentId: number | 0;
    Uniquekey: string | null;
    TaxTrackerId: number | 0;
    NoticeDocumentURL: string | null;
    NoticeDescription: string | null;
    OfficerName: string | null;
    OfficerAddress: string | null;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

// Not-fixed will be changed in future, check with Backend Developer
export interface AddUpdateTaxTrackerDocumentRequest {
    TaxTrackerDocumentId: number | 0;
    Uniquekey: string | null;
    TaxTrackerId: number | 0;
    NoticeDocumentURL: File[] | null;
    RemoveNoticeDocumentURL?: string | null;
    NoticeDescription: string | null;
    OfficerName: string | null;
    OfficerAddress: string | null;
}

export interface DeleteTaxTrackerDocumentRequest {
    TaxTrackerDocumentId: number | 0;
    Uniquekey: string | null;
    TaxTrackerId: number;
}

export type TaxTrackerDocumentListResponse = ApiResponse<TaxTrackerDocumentData[]>;
export type TaxTrackerDocumentSaveResponse = ApiResponse<TaxTrackerDocumentData[]>;
export type TaxTrackerDocumentDeleteResponse = ApiResponse<number[]>;
