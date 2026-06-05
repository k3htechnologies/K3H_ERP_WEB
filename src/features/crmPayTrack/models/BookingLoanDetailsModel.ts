import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBookingLoanDetails {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
    BookingLoanDetailsId?: number;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BookingLoanDetailsData {
    BookingLoanDetailsId: number;
    Uniquekey: string | null;
    BookingId: number;
    ProjectId: number;
    LoanSanctionAmount: number;
    LoanSanctionDate: string;
    BankListMasterId: number;
    BankName: string;
    LoanAccountNumber: string;
    BankBranchName: string;
    Address: string;
    NoOfBankDocument: number | 0
    BankStatusClosedActive: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    
}

export interface AddUpdateBookingLoanDetailsRequest {
    BookingLoanDetailsId?: number;
    Uniquekey?: string | null;
    BookingId: number;
    ProjectId: number;
    LoanSanctionAmount?: number;
    LoanSanctionDate?: string | null;
    BankListMasterId?: number;
    LoanAccountNumber?: string;
    BankBranchName?: string;
    Address?: string;
}

export interface UpdateBookingLoanDetailsStatusRequest {
    BookingLoanDetailsId: number;
    Uniquekey: string,
    ProjectId: number;
    BookingId: number;
}

export interface DeleteBookingLoanDetailsRequest {
    BookingLoanDetailsId: number;
    Uniquekey: string,
    ProjectId: number;
    BookingId: number;
}

export type BookingLoanDetailsListResponse = ApiResponse<BookingLoanDetailsData[]>;
export type BookingLoanDetailsSaveReponse = ApiResponse<BookingLoanDetailsData[]>;
export type BookingLoanDetailsStatusUpdateReponse = ApiResponse<BookingLoanDetailsData[]>;
export type BookingLoanDetailsDeleteResponse = ApiResponse<number>;