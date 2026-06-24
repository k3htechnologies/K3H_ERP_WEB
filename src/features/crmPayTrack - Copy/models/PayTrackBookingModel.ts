import type { ApiResponse } from "@/core/api/ApiResponse"
import type { BookingApplicantData, BookingOtherChargesData, BookingPaymentScheduleData } from "@/features/booking/models/BookingModel";
import type { ParkingData } from "@/features/parking/models/ParkingModel";

export interface FilterWithPaginationPayTrackBooking {
    PageNumber: number;
    PageSize: number;
    IsCheckPermission?: boolean;
    IsFinalRegistrationCompleted?: string | '';
    ProjectId?: number;
    FromDate?: string | null;
    ToDate?: string | null;
    Wing?: string;
    ApplicantName?: string | null;
    Flat?: string
    Floor?: string
    Configuration?: string
    ApplicantMobileNumber?: string
    AgreementValue?: number;
    BookingType?: string;
    SortBy?: string;
    BookingId?: number;
    ExportType?: "PDF" | "Excel";
}


export type PayTrackRow = {
    type: string;
    total: number;
    paid: number;
    pending?: number;
    isTotal?: boolean;
};
export interface PayTrackBookingData {

    BookingId: number | null;
    Uniquekey: string | null;
    ProjectName: string | null;
    ProjectId: number | null;
    EnquiryId: number | null;
    SystemGeneratedCode: string | null;
    ApplicantName: string | null;
    ApplicantMobileNumberCountryCode: string | null;
    ApplicantMobileNumber: string | null;
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
    Source: string | null;
    BrokeragePercentage: number | null;
    BrokerageAmount: number | null;

    ReferralPercentage: number | null;
    ReferralAmount: number | null;

    LoyaltyPercentage: number | null;
    LoyaltyAmount: number | null;

    EmployeeReferencePercentage: number | null;
    EmployeeReferenceAmount: number | null;

    RegistrationDate: string | null;
    FinalRegistrationDate: string | null;
    IsFinalRegistrationCompleted: boolean;
    FinalRegistrationURL: string | null;

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

    CancelledById: number | null;
    CancelledBy: string | null;
    CancelledDate: string | null;

    IsApproval: boolean;
    ApprovalStatus: string | null;

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
    RefundedPaymentLedgerCount: number | null;
    IsApplicableOtherCharge: boolean | null;

    //   MISSING COLUMN IN PAY TRACK BOOKING
    
    PendingLedgerApprovalCount: number | null;

    ReceivedAgreementValue: number | null;
    ReceivedAgreementValueGSTAmount: number | null;
    ReceivedAgreementValueTDS: number | null;

    ReceivedStampDutyAmount: number | null;

    ReceivedRegistrationFees: number | null;

    OtherChargesAmount: number | null;
    ReceivedOtherChargesAmount: number | null;

    OtherChargesGSTAmount: number | null;
    ReceivedOtherChargesGSTAmount: number | null;

    PaymentLedgerApprovalStatus: string | null;
}

export interface PayTrackBookingApplicantData {
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
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}

export interface PayTrackBookingPaymentScheduleData {
    BookingPaymentScheduleId: number | null;
    Type: string | null;
    Name: string | null;
    Date: string | null;
    PaymentSchedulePercentage: number | null;
    PaymentScheduleAmount: number | null;
    PaymentScheduleGSTAmount: number | null;
    PaymentScheduleTDSAmount: number | null;
    CreatedById: number | null;
    CreatedBy: string | null;
    CreatedDate: string | null;
    ModifiedById: number | null;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}


export interface PayTrackBookingOtherChargesData {
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


export type PayTrackBookingListResponse = ApiResponse<PayTrackBookingData[]>;