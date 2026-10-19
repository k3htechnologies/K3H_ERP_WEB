import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeLetterRequest {
    PageSize: number,
    PageNumber: number
    IsCheckPermission?: boolean
    EmployeeId?: number
    EmployeeLetterId?: number
    DocumentName?: string
    Title?: string
    IsShowEmployee?: boolean
    IsAcceptEmployee?: boolean
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeLetterData {
    EmployeeLetterId: number | 0,
    Uniquekey: string | null
    EmployeeId: number | 0
    Title: string | null
    FullName: string | null
    DocumentName: string | null
    DocumentURL: string | null
    IsAcceptEmployee: boolean
    IsShowEmployee: boolean
    IsCheckPermission: boolean
    EmployeeRemark: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateEmployeeLetter {
    EmployeeLetterId: number | 0,
    Uniquekey: string | null
    EmployeeId: number | 0
    Title: string | null
    DocumentName: string | null
    DocumentURL: string | null
}

export interface AddUpdateEmployeeLetterShowEmployee {
    EmployeeLetterId: number | 0
    Uniquekey: string | null
    EmployeeId: number | 0
}

export interface AddUpdateEmployeeLetterAcceptEmployee {
    EmployeeLetterId: number | 0
    Uniquekey: string | null
    EmployeeId: number | 0
    IsAcceptEmployee: boolean
    EmployeeRemark: string | null
}

export interface DeleteEmployeeLetter {
    EmployeeLetterId: number | 0
    Uniquekey: string | null
    EmployeeId: number | 0
}

export type EmployeeLetterListResponse = ApiResponse<EmployeeLetterData[]>;
export type EmployeeLetterSaveResponse = ApiResponse<EmployeeLetterData[]>;
export type EmployeeLetterShowEmployeeSaveResponse = ApiResponse<EmployeeLetterData[]>;
export type EmployeeLetterAcceptEmployeeSaveResponse = ApiResponse<EmployeeLetterData[]>;
export type EmployeeLetterDeleteResponse = ApiResponse<number>;