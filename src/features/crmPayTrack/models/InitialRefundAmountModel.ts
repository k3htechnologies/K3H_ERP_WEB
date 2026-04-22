import type { ApiResponse } from "@/core/api/ApiResponse"
import type { ParkingData } from "@/features/parking/models/ParkingModel";

export interface RefundAmountData {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectName: string | null;
    EnquiryId: number | null;
    SystemGeneratedCode: string | null;
    ApplicantName: string | null;
    BookingType: string | null;
    Flat: string | null;
    ParkingData?: ParkingData[] | null;
    ParkingNumber: string | null;
    InventoryFlatId: number | null;
    InventoryBuildingId: number | null;
    InventoryFlatFloorBasementPodiumWingId: number | null;
    BuildingNumber: string | null;
    Wing: string | null;
    Floor: string | null;
    RERACarpetAreaSqFt: number | null;
    FlatType: string | null;
    FlatConfiguration: string | null;
    BookingApplicantData?: BookingApplicantData[] | null;
    PermanentAddress: string | null;
    CommunicationAddress: string | null;
    BrokeragePercentage: number | null;
    BrokerageAmount: number | null;

    ReferralPercentage: number | null;
    ReferralAmount: number | null;

    LoyaltyPercentage: number | null;
    LoyaltyAmount: number | null;

    EmployeeReferencePercentage: number | null;
    EmployeeReferenceAmount: number | null;

    RegistrationDate: string | null;
    AgreementValue: number | null;
    AgreementValueTDS: number | null;
    AgreementValueGSTPercentage: number | null;
    AgreementValueGSTAmount: number | null;
    StampDutyPercentage: number | null;
    StampDutyAmount: number | null;
    RegistrationFees: number | null;
    ParkingId: string | null;
    NumberOfParking: number | null;
    HandoverType: string | null;
    SourceOfFunding: string | null;
    BookingAmount: number | null;
    ChequeRTGSNumber: string | null;
    ChequeRTGSDate: string | null;
    BankListMasterId: number | null;
    BankName: string | null;
    FlatAlterationRemark: string | null;
    PaymentRemark: string | null;
    OtherRemark: string | null;
    TermsAndConditionsDescription: string | null;
    BookingOtherChargesData?: BookingOtherChargesData[] | null;
    PaymentScheduleSchemeMasterId: number | null;
    PaymentScheduleScheme: string | null;
    BookingPaymentScheduleData?: BookingPaymentScheduleData[] | null;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
    IsApproval: boolean;
    ApprovalStatus: string | null;
    ProjectId: number | null;
    TotalAmountReceivedAgainstBooking: number | null;
    TotalAmountRefundedAgainstBooking: number | null;
    RefundedAmountOnTillDate: number | null;
    FlatAlterationRequestIsApproval: boolean;
    FlatAlterationRequestApprovalStatus: string | null;
    ParkingModificationRequestIsApproval: boolean;
    ParkingModificationRequestApprovalStatus: string | null;
    BookingApplicantModificationRequestIsApproval: boolean;
    BookingApplicantModificationRequestApprovalStatus: string | null;
    TransferBookingId: number | null;
    TransferFlat: string | null;
    TenantId: number | null;
}

// ADD UPDATE REFUND AMOUNT DATA
export interface AddUpdateRefundAmountData {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectId: number | null;
    TotalAmountRefundedAgainstBooking: number | null;

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


