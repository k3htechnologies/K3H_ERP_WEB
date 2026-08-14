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
    TermSheetDetailsId: number
    LoanTakenBy: string
    NameOfInstitutionBankNBFC: string
    Type: string
    TermSheetSanctionDate: string | null
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

    TermSheetSanctionDate: string | null

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

    TermSheetSanctionDate?: string | null

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
}

export interface DeleteTermSheetRepayLedgerRequest {

    TermSheetRepayLedgerId?: number
    TermSheetId?: number
    TermSheetDetailsId: number
    ProjectId?: number
}

export interface FinalizeTermSheetDetails {

    TermSheetId?: number
    ProjectId?: number
    ActionType?: string
}


export type TermSheetListResponse = ApiResponse<TermSheetData[]>

export type TermSheetViewResponse = ApiResponse<TermSheetViewData[]>

export type TermSheetSaveResponse = ApiResponse<TermSheetData[]>

export type TermSheetDeleteResponse = ApiResponse<number>

export type TermSheetDisbursedAmountSaveResponse = ApiResponse<TermSheetDisbursedAmountDetailsData[]>

export type TermSheetSweepRadioSaveResponse = ApiResponse<TermSheetSweepRadioDetailsData[]>

export type TermSheetDirectSellingAgentSaveResponse = ApiResponse<TermSheetDirectSellingAgentData[]>

export type TermSheetRepayLedgerSaveResponse = ApiResponse<TermSheetRepayLedgerData[]>

export type TermSheetFinalApprovalResponse = ApiResponse<TermSheetDetailsData[]>