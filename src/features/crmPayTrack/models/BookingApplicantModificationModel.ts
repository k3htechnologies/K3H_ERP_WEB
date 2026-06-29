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
    ApplicantMobileNumberCountryCode: string;
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
    CancelledChequeURL: string;
    POAURL: string;
    IncomeForm16ITRURL: string;
    NreNroBankDetailsURL: string;
    NomineeFormURL: string;
    StatementOfSourceOfFundsURL: string;
    PaymentProofURL: string;
    ProofOfDocumentURL: string;
    IsApproval: boolean;
    ApprovalStatus: string;
    VersionNumber: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string | null;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string | null;

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
    ApplicantMobileNumberCountryCode: string;
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

    ProofOfDocumentURL?: File[] | null;
    RemoveProofOfDocumentURL?: string;

    ModifiedBy?: string | null;
    CreatedBy?: string | null;

}

export interface DeleteBookingApplicantModificationModelRequest {
    BookingApplicantModificationRequestId: number;
    BookingId: number
    ProjectId: number;
}



export type BookingApplicantModificationListResponse = ApiResponse<BookingApplicantModificationDataRequest[]>;
export type BookingApplicantModificationSaveReponse = ApiResponse<BookingApplicantModificationDataRequest[]>;
export type BookingApplicantModificationDeleteReponse = ApiResponse<number>;
