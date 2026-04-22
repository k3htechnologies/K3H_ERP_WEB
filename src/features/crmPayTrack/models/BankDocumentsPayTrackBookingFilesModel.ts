import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBankDocumentsPayTrackBookingFiles {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
    FileType: string;
    FileName?: string;
    BookingLoanDetailsId?: number;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BankDocumentsPayTrackBookingFilesData {
    PayTrackBookingFilesId: number;
    Uniquekey: string;
    BookingId: number;
    ProjectId: number;
    FileName: string;
    FileType: string;
    BookingLoanDetailsId: number;
    BankStatusClosedActive: string | '';
    PayTrackBookingFilesURL: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string | null;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string | null;
}

export interface AddUpdateBankDocumentsPayTrackBookingFilesRequest {
    PayTrackBookingFilesId?: number;
    Uniquekey?: string;
    BookingId: number;
    ProjectId: number;
    FileName?: string;
    FileType?: string;
    IsMaster?: number;
    PayTrackBookingFilesURL? : File[] | null; 
    RemovePayTrackBookingFilesURL?: string;
}

export interface DeleteBankDocumentsPayTrackBookingFilesRequest {
    PayTrackBookingFilesId: number;
    Uniquekey: string;
    BookingId: number;
    ProjectId: number;
}

export type BankDocumentsPayTrackBookingFilesListResponse = ApiResponse<BankDocumentsPayTrackBookingFilesData[]>;
export type BankDocumentsPayTrackBookingFilesSaveResponse = ApiResponse<BankDocumentsPayTrackBookingFilesData[]>;
export type BankDocumentsPayTrackBookingFilesDeleteResponse = ApiResponse<number>;