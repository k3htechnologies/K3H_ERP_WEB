import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationShiftMappingMasterRequest {
    PageSize: number
    PageNumber: number
    ShiftManagementMasterMappingId?: number
    ShiftName?: string
    DepartmentName?: string
    EmployeeName?: string
    EmployeeId?: number
    IsCheckEmployeeShift?:boolean
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

    ShiftBeginTime: string | ''            
    ShiftEndTime: string | ''              
    ShiftDurationTime: string | ''         
    ShiftWorkDurationTime: string | ''     
    FirstHalfUpTo: string | ''             
    AbsentWorkingHours: string | ''        
    HalfDayWorkingHours: string | ''       
    HalfDayInTimeAfter: string | ''        
    HalfDayOutTimeBefore: string | ''      

    BreakBeginTime: string | ''            
    BreakEndTime: string | ''              
    BreakDurationTime: string | ''         
    GraceTime: string | ''                 

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
