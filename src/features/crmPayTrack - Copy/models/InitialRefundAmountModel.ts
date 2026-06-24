import type { ApiResponse } from "@/core/api/ApiResponse"

export interface AddUpdateRefundAmountData {
    BookingId: number;
    Uniquekey: string;
    ProjectId: number;
    TotalAmountRefundedAgainstBooking: number;

}
export interface BookingApplicantData {
    BookingApplicantId: number | null;
    ApplicantType: string | null;
    ApplicantName: string | null;
    ApplicantMobileNumber: string | null;
    ApplicantEmailId: string | null;
    PhotoURL: string | null;
    AadharCardNumber: string | null;
    AadharCardURL: string | null;
    PanNumber: string | null;
    PanCardURL: string | null;
    PassportNumber: string | null;
    PassportURL: string | null;
    DrivingLicenseNumber: string | null;
    DrivingLicenseURL: string | null;
    VotingIdNumber: string | null;
    VotingIdURL: string | null;
    GSTNumber: string | null;
    GSTNumberURL: string | null;
    CancelledChequeURL: string | null;
    POAURL: string | null;
    IncomeForm16ITRURL: string | null;
    NreNroBankDetailsURL: string | null;
    NomineeFormURL: string | null;
    StatementOfSourceOfFundsURL: string | null;
    PaymentProofURL: string | null;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}

export interface BookingOtherChargesData {
    BookingOtherChargesId: number | null;
    Uniquekey: string | null;
    ChargeName: string | null;
    CalculatedOn: string | null;
    Value: number | null;
    GSTPercentage: number | null;
    GSTValue: number | null;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}

export interface BookingPaymentScheduleData {
    BookingPaymentScheduleId: number | null;
    Type: string | null;
    Name: string | null;
    Date: string | null;
    PaymentSchedulePercentage: number | null;
    PaymentScheduleCumulative: number | null;
    PaymentScheduleAmount: number | null;
    PaymentScheduleGSTAmount: number | null;
    PaymentScheduleTDSAmount: number | null;
    Rank: number | null;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}

export type AddUpdateRefundAmountResponse = ApiResponse<string>;


