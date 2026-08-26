import type { ApiResponse } from '@/core/api/ApiResponse'

export interface FilterWithPaginationTermSheetReportRequest {

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

export interface TermSheetReportData {

    ProjectName: string
    CompanyName: string
    ApprovalStatus: string
    ClosingDate: string | null;
    LoanTakenBy: string
    NameOfInstitutionBankNBFC: string
    Type: string
    SanctionDate: string | null
    FacilityAmount: number
    RateOfInterestInPercentage: number
    TermSheetURL: string
    TotalDisbursedAmount: number
    TotalRepayLedgerAmount: number
    BalanceDisbursementAmount:number
    BalanceAsOnDateAmount:number
}

export type TermSheetReportListResponse = ApiResponse<TermSheetReportData[]>