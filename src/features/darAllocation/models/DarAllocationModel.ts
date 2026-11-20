import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationDarAllocationRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    EmployeeName?: string
    Location?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DarAllocationData {
    DarAllocationId: number | 0
    Uniquekey: string | null
    EmployeeName: string | null
    EmployeeId: number | 0
    VillageName: string | null
    VillageMasterId: string | null
    NumberOfChannelPartner: number | 0
    CreatedById: number | 0
    CreatedBy: string | null
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | null
    ModifiedDate: string | null
}

export interface AddUpdateDarAllocationRequest {
    DarAllocationId: number | 0
    Uniquekey: string | null
    EmployeeId: number
    VillageMasterId: string | null
}

export interface DarEmployeeDetails {
    Department?: string | null
    Designation?: string | null
    Branch?: string | null
    ReportPersonName?: string | null
    EmailId?: string | null
    PersonalMobileNumber?: string | null
    JoiningDate?: string | null
}

export interface DeleteDarAllocationRequest {
    DarAllocationId: number | null
    Uniquekey: string | null
}

export type DarAllocationListResponse = ApiResponse<DarAllocationData[]>;
export type DarAllocationSaveResponse = ApiResponse<DarAllocationData[]>;
export type DarAllocationDeleteResponse = ApiResponse<number[]>;