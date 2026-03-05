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

    LateArrivalAction: string | ''

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

    LateArrivalAction: string | ''
}

export interface DeleteShiftMasterRequest {
    ShiftManagementMasterId: number
    UniqueKey: string
}

export type ShiftMasterListResponse = ApiResponse<ShiftMasterData[]>;
export type ShiftMasterSaveResponse = ApiResponse<ShiftMasterData[]>;
export type ShiftMasterDeleteResponse = ApiResponse<number>;
