import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationProcessSalaryRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ProcessSalaryId?: number
    SalaryProcessMonthYear?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProcessSalaryData {
    ProcessSalaryId: number | 0
    Uniquekey: string | null
    SalaryProcessMonthYear: string | null
    DepartmentMasterId: string | null
    Department: string | null
    CompanyId: string | null
    CompanyName: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateProcessSalary {
    ProcessSalaryId: number | 0
    Uniquekey: string | null
    SalaryProcessMonthYear: string | null
    DepartmentMasterId: string | null
    CompanyId: string | null
}

export interface DeleteProcessSalary {
    ProcessSalaryId: number | 0
    Uniquekey: string | null
}

export interface FilterWithPaginationProcessSalaryDetails {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ProcessSalaryId: number
    ProcessSalaryDetailsId?: number
    EmployeeName?: string
    DepartmentName?: string
    CompanyName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProcessSalaryDetailsData {
    ProcessSalaryDetailsId: number | 0
    Uniquekey: string | null
    SalaryProcessMonthYear: string | null
    EmployeeCode: string | null
    FullName: string | null
    Department: string | null
    CompanyName: string | null
    TotalDays: number | 0
    WorkingDays: number | 0
    PresentDays: number | 0
    AbsentDays: number | 0
    OfficeHoliday: number | 0
    PaidDays: number | 0
    UnPaidDays: number | 0
    AdjustLeave: number | 0
    AdjustDays: number | 0
    HoldRelease: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateProcessSalaryDetails {
    ProcessSalaryDetailsId: number | 0
    Uniquekey: string | null
    AdjustDays: number | 0
    HoldRelease: string | null
}

export type ProcessSalaryListResponse = ApiResponse<ProcessSalaryData[]>;
export type ProcessSalarySaveResponse = ApiResponse<ProcessSalaryData[]>;
export type ProcessSalaryDeleteResponse = ApiResponse<number[]>;
export type ProcessSalaryDetailsListResponse = ApiResponse<ProcessSalaryDetailsData[]>;
export type ProcessSalaryDetailsSaveResponse = ApiResponse<ProcessSalaryDetailsData[]>;