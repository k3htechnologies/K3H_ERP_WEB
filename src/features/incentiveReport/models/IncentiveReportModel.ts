import type { ApiResponse } from "@/core/api/ApiResponse"
import type { BookingApplicantData, BookingOtherChargesData, BookingPaymentScheduleData } from "@/features/booking/models/BookingModel";
import type { ParkingData } from "@/features/parking/models/ParkingModel";

//=============================================================
// [ FILTER REQUEST ]
//=============================================================
export interface FilterWithPaginationIncentiveReportRequest {
    PageSize: number;
    PageNumber: number;
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
    ExportType?: 'Excel' | 'PDF' | 'BOOKING FORM PDF';
}

//=============================================================
// [ BOOKING DATA ]
//=============================================================
export interface IncentiveReportData {
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

//=============================================================
// [ API RESPONSE TYPES ]
//=============================================================
export type IncentiveReportListResponse = ApiResponse<IncentiveReportData[]>;

