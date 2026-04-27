import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBookingApplicantModificationRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId: number;
    BookingId: number;
}

export interface BookingApplicantModificationDataRequest {
    BookingApplicantModificationRequestId: number;
    ApplicantType: string;
    ApplicantName: string;
    ApplicantMobileNumber: string;
    ApplicantEmailId: string;
    PhotoURL: string;
    AadharCardNumber: string;
    AadharCardURL: string;
    PanNumber: string;
    PanCardURL: string;
    PassportNumber: string;
    PassportURL: string;
    DrivingLicenseNumber: string;
    DrivingLicenseURL: string;
    VotingIdNumber: string;
    VotingIdURL: string;
    GSTNumber: string;
    GSTNumberURL: string;
    CancelledChequeURL: string | null;
    POAURL: string | null;
    IncomeForm16ITRURL: string | null;
    NreNroBankDetailsURL: string | null;
    NomineeFormURL: string | null;
    StatementOfSourceOfFundsURL: string | null;
    PaymentProofURL: string | null;
    IsApproval: boolean;
    ApprovalStatus: string;
    VersionNumber: string;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
    BookingApplicantModificationDocumentUploadURL: string | null;

}

export interface AddUpdateBookingApplicantModificationRequest {
    ProjectId: number;
    BookingId: number;

}

export interface BookingApplicantModificationRequest {
    BookingApplicantModificationRequestId: number;
    RemovePhotoURL: string;
    RemoveGSTNumberURL: string;
    PanCardURL?: File[] | null;
    DrivingLicenseNumber: string;
    RemoveAadharCardURL: string;
    RemovePanCardURL: string;
    PanNumber: string;
    RemoveVotingIdURL: string;
    AadharCardURL?: File[] | null;
    VotingIdNumber: string;
    ApplicantName: string;
    VotingIdURL?: File[] | null;
    ApplicantMobileNumber: string;
    AadharCardNumber: string;
    RemoveDrivingLicenseURL: string;
    GSTNumber: string;
    DrivingLicenseURL?: File[] | null;
    ApplicantEmailId: string;
    RemovePassportURL: string;
    PassportNumber: string;
    ApplicantType: string;
    PhotoURL?: File[] | null;
    PassportURL?: File[] | null;
    GSTNumberURL?: File[] | null;

    CancelledChequeURL?: File[] | null;
    RemoveCancelledChequeURL?: string;

    POAURL?: File[] | null;
    RemovePOAURL?: string;

    IncomeForm16ITRURL?: File[] | null;
    RemoveIncomeForm16ITRURL?: string;

    NreNroBankDetailsURL?: File[] | null;
    RemoveNreNroBankDetailsURL?: string;

    NomineeFormURL?: File[] | null;
    RemoveNomineeFormURL?: string;

    StatementOfSourceOfFundsURL?: File[] | null;
    RemoveStatementOfSourceOfFundsURL?: string;

    PaymentProofURL?: File[] | null;
    RemovePaymentProofURL?: string;
    BookingApplicantModificationDocumentUploadURL?: File[] | null;
    RemoveBookingApplicantModificationDocumentUploadURL?: string;
}

export type BookingApplicantModificationListResponse = ApiResponse<BookingApplicantModificationDataRequest[]>;
export type BookingApplicantModificationSaveReponse = ApiResponse<BookingApplicantModificationDataRequest[]>;
