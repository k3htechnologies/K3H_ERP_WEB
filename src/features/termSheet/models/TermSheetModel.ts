import type { ApiResponse } from '@/core/api/ApiResponse'

export interface FilterWithPaginationTermSheetRequest {

    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ApprovalStatus?: string
    ProjectId?: number
    TermSheetId?: number
    TermSheetDetailsId?: number
    NameOfInstitutionBankNBFC?: string
    ProjectName?: string
    CompanyName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}


export interface TermSheetData {

    TermSheetId: number
    Uniquekey: string

    ProjectId: number
    ProjectName: string
    CompanyId: number
    CompanyName: string
    ApprovalStatus: string
    ClosingDate: string | null;
    ClosingRemark: string;
    TermSheetDetailsId: number
    LoanTakenBy: string
    NameOfInstitutionBankNBFC: string
    Type: string
    TermSheetDate: string | null
    SanctionDate: string | null
    FacilityAmount: number
    RateOfInterestInPercentage: number
    ProcessingFeesInPercentage: number
    LegalAndDoumentationFees: number
    MonotoriumPeriodInMonth: number
    LoanTenureInMonth: number
    MinimumSellingPrice: number
    OtherImportantTermsIfAny: string
    Remark: string
    LoanStartDate: string | null
    LoanEndDate: string | null
    EMIAmount: number
    TermSheetURL: string
    TotalDisbursedAmount: number
    TotalRepayLedgerAmount: number
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null
    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface TermSheetViewData {

    TermSheetId: number
    Uniquekey: string
    ProjectId: number
    ProjectName: string
    CompanyId: number
    CompanyName: string
    ApprovalStatus: string
    ClosingDate: string | null;
    ClosingRemark: string;
    TermSheetDetailsData: TermSheetDetailsData[]
    IsClosed?: boolean
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface TermSheetDetailsData {

    TermSheetDetailsId: number
    Uniquekey: string

    TermSheetId: number
    ProjectId: number

    LoanTakenBy: string
    NameOfInstitutionBankNBFC: string
    Type: string

    TermSheetDate: string | null
    SanctionDate: string | null
    FacilityAmount: number
    RateOfInterestInPercentage: number
    ProcessingFeesInPercentage: number
    LegalAndDoumentationFees: number
    MonotoriumPeriodInMonth: number
    LoanTenureInMonth: number
    MinimumSellingPrice: number
    OtherImportantTermsIfAny: string
    Remark: string
    LoanStartDate: string | null
    LoanEndDate: string | null
    EMIAmount: number
    TermSheetURL: string

    TermSheetDisbursedAmountDetailsData: TermSheetDisbursedAmountDetailsData[]

    TermSheetSweepRadioDetailsData: TermSheetSweepRadioDetailsData[]

    TermSheetDirectSellingAgentData: TermSheetDirectSellingAgentData[]

    TermSheetRepayLedgerData: TermSheetRepayLedgerData[]

    TermSheetDebtServiceReserveAccountData: TermSheetDebtServiceReserveAccountData[]

    TotalDisbursedAmount: number

    TotalRepayLedgerAmount: number

    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null

    IsApproval: boolean
    ApprovalStatus: string
}


export interface TermSheetDisbursedAmountDetailsData {

    TermSheetDisbursedAmountDetailsId: number
    Uniquekey: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId: number

    DisbursedAmount: number
    DisbursedDate: string | null
    Remark: string
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}


export interface TermSheetSweepRadioDetailsData {

    TermSheetSweepRadioDetailsId: number
    Uniquekey: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId: number

    OwnSweepRadioInPercentage?: number
    LenderSweepRadioInPercentage?: number
    Date: string | null
    Remark: string
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface TermSheetDirectSellingAgentData {

    TermSheetDirectSellingAgentId: number
    Uniquekey: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId: number

    Amount: number
    NameOfConsultant: string
    CommissionInPercentage: number
    PaymentDate: string | null
    Remark: string
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface TermSheetRepayLedgerData {
    TermSheetRepayLedgerId: number
    Uniquekey: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId: number

    Amount: number
    PaymentDate: string | null
    Remark: string
    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface TermSheetDebtServiceReserveAccountData {
    TermSheetDebtServiceReserveAccountId: number
    Uniquekey: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId: number

    Term: string; // MF / FD
    Unit: number; // MF
    PerUnitRate: number; // MF
    Amount: number; // MF / FD
    Date: string | null; // MF / FD

    RateOfInterestInPercentage: number; // FD
    RedemptionValue: number; // FD
    MaturityPeriod: number; // FD

    WithdrawAmount: number; // MF / FD
    WithdrawDate: string | null; // MF / FD

    Remark: string; // MF / FD

    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface AddUpdateTermSheetRequest {

    TermSheetId?: number
    Uniquekey?: string | null
    ProjectId?: number
    CompanyId: number
}

export interface AddUpdateTermSheetDetailsRequest {

    TermSheetDetailsId?: number
    Uniquekey?: string | null;

    TermSheetId?: number
    ProjectId?: number

    LoanTakenBy?: string
    NameOfInstitutionBankNBFC?: string
    Type?: string

    TermSheetDate: string | null
    SanctionDate: string | null

    FacilityAmount?: number
    RateOfInterestInPercentage?: number
    ProcessingFeesInPercentage?: number
    LegalAndDoumentationFees?: number

    MonotoriumPeriodInMonth?: number
    LoanTenureInMonth?: number

    MinimumSellingPrice?: number

    OtherImportantTermsIfAny?: string
    Remark?: string

    LoanStartDate?: string | null
    LoanEndDate?: string | null

    EMIAmount?: number

    TermSheetURL?: File[] | null;

    RemoveTermSheetURL?: string
}

export interface DeleteTermSheetRequest {

    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}


export interface AddUpdateTermSheetDisbursedAmountDetailsRequest {

    TermSheetDisbursedAmountDetailsId?: number
    Uniquekey?: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId?: number

    DisbursedAmount?: number
    DisbursedDate?: string | null
    Remark?: string

}

export interface DeleteTermSheetDisbursedAmountDetailsRequest {

    TermSheetDisbursedAmountDetailsId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}


export interface AddUpdateTermSheetSweepRadioDetailsRequest {

    TermSheetSweepRadioDetailsId?: number
    Uniquekey?: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId?: number

    OwnSweepRadioInPercentage?: number
    LenderSweepRadioInPercentage?: number
    Date?: string | null
    Remark?: string
}

export interface DeleteTermSheetSweepRadioDetailsRequest {

    TermSheetSweepRadioDetailsId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}

export interface AddUpdateTermSheetDirectSellingAgentRequest {

    TermSheetDirectSellingAgentId?: number
    Uniquekey?: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId?: number

    Amount?: number
    NameOfConsultant?: string
    CommissionInPercentage?: number
    PaymentDate?: string | null
    Remark?: string
}


export interface DeleteTermSheetDirectSellingAgentRequest {

    TermSheetDirectSellingAgentId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}

export interface AddUpdateTermSheetRepayLedgerRequest {

    TermSheetRepayLedgerId?: number
    Uniquekey?: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId?: number

    Amount?: number
    PaymentDate?: string | null
    Remark?: string
}

export interface DeleteTermSheetRepayLedgerRequest {

    TermSheetRepayLedgerId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}
export interface AddUpdateTermSheetDebtServiceReserveAccountRequest {

    TermSheetDebtServiceReserveAccountId?: number
    Uniquekey?: string

    TermSheetId: number
    TermSheetDetailsId: number
    ProjectId?: number

    Term: string; // MF / FD
    Unit: number; // MF
    PerUnitRate: number; // MF
    Amount: number; // MF / FD
    Date: string | null; // MF / FD

    RateOfInterestInPercentage: number; // FD
    RedemptionValue: number; // FD
    MaturityPeriod: number; // FD

    WithdrawAmount: number; // MF / FD
    WithdrawDate: string | null; // MF / FD

    Remark: string; // MF / FD
}

export interface DeleteTermSheetDebtServiceReserveAccountRequest {

    TermSheetDebtServiceReserveAccountId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}

export interface FinalizeTermSheetDetails {

    TermSheetId?: number
    ProjectId?: number
    ActionType?: string
    ClosingDate?: string | null;
    ClosingRemark?: string;
}


export type TermSheetListResponse = ApiResponse<TermSheetData[]>

export type TermSheetViewResponse = ApiResponse<TermSheetViewData[]>

export type TermSheetSaveResponse = ApiResponse<TermSheetData[]>

export type TermSheetDeleteResponse = ApiResponse<number>

export type TermSheetDisbursedAmountSaveResponse = ApiResponse<TermSheetDisbursedAmountDetailsData[]>

export type TermSheetSweepRadioSaveResponse = ApiResponse<TermSheetSweepRadioDetailsData[]>

export type TermSheetDirectSellingAgentSaveResponse = ApiResponse<TermSheetDirectSellingAgentData[]>

export type TermSheetRepayLedgerSaveResponse = ApiResponse<TermSheetRepayLedgerData[]>

export type TermSheetDebtServiceReserveAccountSaveResponse = ApiResponse<TermSheetDebtServiceReserveAccountData[]>

export type TermSheetFinalApprovalResponse = ApiResponse<TermSheetDetailsData[]>