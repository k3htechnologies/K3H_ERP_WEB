import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationShiftMasterRequest {
    PageSize: number
    PageNumber: number
    ShiftManagementMasterId?: number
    ShiftName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ShiftMasterData {
    ShiftManagementMasterId: number | 0
    Uniquekey: string | null

    ShiftCode: string | ''
    ShiftName: string | ''

    ShiftBeginTime: string | ''     // TimeSpan
    ShiftEndTime: string | ''       // TimeSpan
    ShiftDurationTime: string | ''  // TimeSpan
    ShiftWorkDurationTime: string | '' // TimeSpan
    FirstHalfUpTo: string | ''      // TimeSpan
    AbsentWorkingHours: string | '' // TimeSpan
    HalfDayWorkingHours: string | '' // TimeSpan
    HalfDayInTimeAfter: string | ''  // TimeSpan
    HalfDayOutTimeBefore: string | '' // TimeSpan

    BreakBeginTime: string | ''     // TimeSpan
    BreakEndTime: string | ''       // TimeSpan
    BreakDurationTime: string | ''  // TimeSpan
    GraceTime: string | ''          // TimeSpan

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

export interface AddUpdateShiftMasterRequest {
    ShiftManagementMasterId: number | 0
    Uniquekey: string | null

    ShiftCode: string | ''
    ShiftName: string | ''

    ShiftBeginTime: string | ''           // TimeSpan
    ShiftEndTime: string | ''             // TimeSpan
    ShiftDurationTime: string | ''        // TimeSpan
    ShiftWorkDurationTime: string | ''    // TimeSpan
    FirstHalfUpTo: string | ''            // TimeSpan
    AbsentWorkingHours: string | ''       // TimeSpan
    HalfDayWorkingHours: string | ''      // TimeSpan
    HalfDayInTimeAfter: string | ''       // TimeSpan
    HalfDayOutTimeBefore: string | ''     // TimeSpan

    BreakBeginTime: string | ''           // TimeSpan
    BreakEndTime: string | ''             // TimeSpan
    BreakDurationTime: string | ''        // TimeSpan
    GraceTime: string | ''                

    Remarks: string | ''
}

export interface DeleteShiftMasterRequest {
    ShiftManagementMasterId: number
    UniqueKey: string
}

export type ShiftMasterListResponse = ApiResponse<ShiftMasterData[]>;
export type ShiftMasterSaveResponse = ApiResponse<ShiftMasterData[]>;
export type ShiftMasterDeleteResponse = ApiResponse<number>;
