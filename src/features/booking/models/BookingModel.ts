import type { ApiResponse } from "@/core/api/ApiResponse"
import type { ParkingData } from "@/features/parking/models/ParkingModel";

//=============================================================
// [ FILTER REQUEST ]
//=============================================================
export interface FilterWithPaginationBookingRequest {
    PageSize: number;
    PageNumber: number;
    IsCheckPermission?: boolean;
    BookingId?: number;
    ProjectId?: number;
    ApplicantMobileNumber?: string;
    ApplicantName?: string;
    FromDate?: string | null;
    ToDate?: string | null;
    Wing?: string;
    Flat?: string;
    Floor?: string;
    Source?: string;
    SubSource?: string;
    SubSubSource?: string;
    AgreementValue?: number;
    BookingType?: string;
    SortBy?: string;
    ExportType?: 'Excel' | 'PDF' | 'BOOKING FORM PDF' | 'BOOKING FORM PDF ON MAIL' | "" | "WELCOME MESSAGE ON MAIL" | "WELCOME MESSAGE";
}

export interface FilterWithPaginationChannelPartnerBookingRequest {
    PageSize: number;
    PageNumber: number;
    ChannelPartnerId?: number;
    BookingId?: number;
    ProjectId?: number;
    ApplicantMobileNumber?: string;
    ApplicantName?: string;
    FromDate?: string | null;
    ToDate?: string | null;
    Wing?: string;
    Flat?: string;
    Floor?: string;
    Source?: string;
    AgreementValue?: number;
    SortBy?: string;
    ExportType?: 'Excel' | 'PDF' | 'BOOKING FORM PDF';
}

export interface FilterPaymentScheduleStagesRequest {
    ProjectId?: number;
    InventoryBuildingId?: number;
    InventoryFlatFloorBasementPodiumWingId?: number;
    ExportType?: 'Excel' | 'PDF';
}


//=============================================================
// [ BOOKING DATA ]
//=============================================================
export interface BookingData {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectName: string | null;
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
    LedgerCount: number | null;
    IsApplicableOtherCharge:boolean | null;
}

export interface BookingApplicantData {
    BookingApplicantId: number | null;
    ApplicantType: string | null;
    ApplicantName: string | null;
    ApplicantMobileNumberCountryCode: string | null;
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
//=============================================================
// [ ADD UPDATE REQUEST ]
//=============================================================
export interface AddUpdateBookingRequest {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectId: number | null;
    EnquiryId: number | null;
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

    InventoryFlatId: number | null;
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
    RegistrationDate: string | null;
    SourceOfFunding: string | null;
    FlatAlterationRemark: string | null;
    PaymentRemark: string | null;
    OtherRemark: string | null;
    TermsAndConditionsDescription: string | null;
    BookingType: string | null;
    IsApplicableOtherCharge:boolean | null;
    OtherChargesDetailJSON: string | null;
    PaymentScheduleSchemeMasterId: number | null;
    PaymentScheduleDetailJSON: string | null;
    BookingAmount: number | null;
    ChequeRTGSNumber: string | null;
    ChequeRTGSDate: string | null;
    BankListMasterId: number | null;
    TransferBookingId: number | null;
    TenantId: number | null;
    OTP?: string | null;
}

export interface AddUpdateBookingApplicantRequest {
    BookingApplicantId: number | null;
    ApplicantType: string | null;
    ApplicantName: string | null;
    ApplicantMobileNumberCountryCode: string | null;
    ApplicantMobileNumber: string | null;
    ApplicantEmailId: string | null;
    PhotoURL?: File[] | null;
    RemovePhotoURL?: string | null;
    AadharCardNumber: string | null;
    AadharCardURL?: File[] | null;
    RemoveAadharCardURL?: string | null;
    PanNumber: string | null;
    PanCardURL?: File[] | null;
    RemovePanCardURL?: string | null;
    PassportNumber: string | null;
    PassportURL?: File[] | null;
    RemovePassportURL?: string | null;
    DrivingLicenseNumber: string | null;
    DrivingLicenseURL?: File[] | null;
    RemoveDrivingLicenseURL?: string | null;
    VotingIdNumber: string | null;
    VotingIdURL?: File[] | null;
    RemoveVotingIdURL?: string | null;
    GSTNumber: string | null;
    GSTNumberURL?: File[] | null;
    RemoveGSTNumberURL?: string | null;

    CancelledChequeURL?: File[] | null;
    RemoveCancelledChequeURL?: string | null;

    POAURL?: File[] | null;
    RemovePOAURL?: string | null;

    IncomeForm16ITRURL?: File[] | null;
    RemoveIncomeForm16ITRURL?: string | null;

    NreNroBankDetailsURL?: File[] | null;
    RemoveNreNroBankDetailsURL?: string | null;

    NomineeFormURL?: File[] | null;
    RemoveNomineeFormURL?: string | null;

    StatementOfSourceOfFundsURL?: File[] | null;
    RemoveStatementOfSourceOfFundsURL?: string | null;

    PaymentProofURL?: File[] | null;
    RemovePaymentProofURL?: string | null;
}
export interface AddUpdateBookingOtherChargesRequest {
    BookingOtherChargesId: number | null;
    Uniquekey: string | null;
    ChargeName: string | null;
    CalculatedOn: string | null;
    Value: number | null;
    GSTPercentage: number | null;
    GSTValue: number | null;
}

export interface AddUpdateBookingPaymentScheduleRequest {
    BookingPaymentScheduleId: number | null;
    Type: string | null;
    Name: string | null;
    Date: string | null;
    PaymentSchedulePercentage: number | null;
    PaymentScheduleAmount: number | null;
    PaymentScheduleGSTAmount: number | null;
    PaymentScheduleTDSAmount: number | null;
}
//=============================================================
// [ CANCEL REQUEST ]
//=============================================================
export interface CancelBookingRequest {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectId: number | null;
    InventoryFlatId: number | null;
    ParkingId: string | null;
}

//=============================================================
// [ PAYMENT SCHEDULE STAGES ]
//=============================================================
export interface PaymentScheduleStagesData {
    Stages: string | null;
    Message?: string | null;
    TotalRecords?: number | null;
}

export interface UpdatePayTrackBookingRegistrationDateParking {
    BookingId: number | null;
    Uniquekey: string | null;
    ProjectId: number | null;
    FinalRegistrationDate: string | null;
    ParkingId: string | null;
}

//=============================================================
// [ API RESPONSE TYPES ]
//=============================================================
export type BookingListResponse = ApiResponse<BookingData[]>;
export type BookingSaveResponse = ApiResponse<BookingData[]>;
export type BookingDeleteResponse = ApiResponse<number>;
export type PaymentScheduleStagesResponse = ApiResponse<PaymentScheduleStagesData[]>;
export type BookingUpdateegistrationDateParkingResponse = ApiResponse<BookingData[]>;

