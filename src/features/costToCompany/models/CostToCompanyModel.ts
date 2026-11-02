import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCostToCompanyRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    CostToCompanyId?: number
    EmployeeName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface FilterWithPaginationCostToCompanyById {
    CostToCompanyId: number
    ExportType?: 'Excel' | 'PDF'
}

export interface CostToCompanyData {
    CostToCompanyId: number | 0
    Uniquekey: string | null
    EmployeeId: number | 0
    EmployeeName: string | null
    EffectiveFromDate: string | null
    EffectiveToDate: string | null
    AnnualCTC: number | 0
    MonthlyCTC: number | 0
    IsProvidentFund: boolean
    EmployeesStateInsuranceCorporation: boolean
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    CostToCompanyEarningData: CostToCompanyEarningData[]
    CostToCompanyDeductionData: CostToCompanyDeductionData[]
    EmployeeCode: string | null
    Department: string | null
    Designation: string | null
    Branch: string | null
    JoiningDate: string | null
    PanCardNumber: string | null
    BankName: string | null
    AccountNo: string | null
}

export interface CostToCompanyEarningData {
    EarningName: string | null
    Appliable: string | null
    Value: number | 0
    MonthlyAmount: number | 0
    YearlyAmount: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface CostToCompanyDeductionData {
    DeductionName: string | null
    Appliable: string | null
    Value: number | 0
    MonthlyAmount: number | 0
    YearlyAmount: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateCostToCompanyData {
    CostToCompanyId: number | 0
    Uniquekey: string | null
    EmployeeId: number | 0
    EffectiveFromDate: string | null
    EffectiveToDate: string | null
    AnnualCTC: number | 0
    MonthlyCTC: number | 0
    IsProvidentFund: boolean
    EmployeesStateInsuranceCorporation: boolean
}

export interface DeleteCostToCompany {
    CostToCompanyId: number | 0
    Uniquekey: string | null
}

export type CostToCompanyListResponse = ApiResponse<CostToCompanyData[]>;
export type CostToCompanyByIdListResponse = ApiResponse<CostToCompanyData[]>;
export type CostToCompanySaveResponse = ApiResponse<CostToCompanyData[]>;
export type CostToCompanyDeleteResponse = ApiResponse<number>;