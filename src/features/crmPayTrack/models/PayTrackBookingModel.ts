import type { ApiResponse } from "@/core/api/ApiResponse"
import type { BookingApplicantData, BookingOtherChargesData } from "@/features/booking/models/BookingModel";
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
    ProjectName: string | null;
    ProjectId: number | null;
    EnquiryId: number | null;
    SystemGeneratedCode: string | null;
    ApplicantName: string | null;
    ApplicantMobileNumber: string | null;
    ApplicantMobileNumberCountryCode: string | null;
    BookingType: string | null;
    ParkingData: ParkingData[] | null;

    InventoryFlatId: number | null;
    BuildingNumber: string | null;
    Wing: string | null;
    Floor: string | null;
    Flat: string | null;
    NumberOfParking:number;
    ParkingNumber: string | null;
    FlatType: string | null;
    RERACarpetAreaSqFt: number | null;
    FlatConfiguration: string | null;
    
    RegistrationDate: string | null;
    FinalRegistrationDate: string | null;
    IsFinalRegistrationCompleted:boolean;
    FinalRegistrationURL: string | null;
    
    FlatAlterationRemark: string | null;
    AgreementValue: number | null;
    ReceivedAgreementValue: number | null;

    AgreementValueGSTAmount: number | null;
    ReceivedAgreementValueGSTAmount: number | null;

    StampDutyAmount: number | null;
    ReceivedStampDutyAmount: number | null;

    RegistrationFees: number | null;
    ReceivedRegistrationFees: number | null;

    AgreementValueTDS: number | null;
    ReceivedAgreementValueTDS: number | null;

    OtherChargesAmount: number | null;
    ReceivedOtherChargesAmount: number | null;

    OtherChargesGSTAmount: number | null;
    ReceivedOtherChargesGSTAmount: number | null;

    BookingApprovalStatus: string | null;

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
    TenantId: number | null;
    LedgerCount: number | null;
    BookingOtherChargesData?: BookingOtherChargesData[] | null;
    BookingApplicantData?: BookingApplicantData[] | null;
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