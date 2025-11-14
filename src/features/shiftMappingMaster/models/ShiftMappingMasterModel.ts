import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationShiftMappingMasterRequest {
    PageSize: number
    PageNumber: number
    ShiftManagementMasterMappingId?: number
    ShiftName?: string
    DepartmentName?: string
    EmployeeName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ShiftMappingMasterData {
    ShiftManagementMasterMappingId: number | 0
    Uniquekey: string | null

    DepartmentMasterId: string | ''
    DepartmentName: string | ''

    EmployeeId: string | ''
    EmployeeName: string | ''

    ShiftManagementMasterId: number | 0
    ShiftCode: string | ''
    ShiftName: string | ''

    ShiftBeginTime: string | ''            // TimeSpan
    ShiftEndTime: string | ''              // TimeSpan
    ShiftDurationTime: string | ''         // TimeSpan
    ShiftWorkDurationTime: string | ''     // TimeSpan
    FirstHalfUpTo: string | ''             // TimeSpan
    AbsentWorkingHours: string | ''        // TimeSpan
    HalfDayWorkingHours: string | ''       // TimeSpan
    HalfDayInTimeAfter: string | ''        // TimeSpan
    HalfDayOutTimeBefore: string | ''      // TimeSpan

    BreakBeginTime: string | ''            // TimeSpan
    BreakEndTime: string | ''              // TimeSpan
    BreakDurationTime: string | ''         // TimeSpan
    GraceTime: string | ''                 // TimeSpan

    Remarks: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateShiftMappingMasterRequest {
    ShiftManagementMasterMappingId: number | 0
    Uniquekey: string | null
    ShiftManagementMasterId: number | 0
    DepartmentMasterId: string | ''
    EmployeeId: string | ''
}

export interface DeleteShiftMappingMasterRequest {
    ShiftManagementMasterMappingId: number
    UniqueKey: string
}

export type ShiftMappingMasterListResponse = ApiResponse<ShiftMappingMasterData[]>;
export type ShiftMappingMasterSaveResponse = ApiResponse<ShiftMappingMasterData[]>;
export type ShiftMappingMasterDeleteResponse = ApiResponse<number>;
