import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationWeekOffMasterRequest {
    PageSize: number
    PageNumber: number
    WeekOffPolicyMasterId?: number
    WeekOffPolicyName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface WeekOffMasterData {
    WeekOffPolicyMasterId: number | 0
    Uniquekey: string | null
    WeekOffPolicyCode: string | ''
    WeekOffPolicyName: string | ''
    WeekDays: number | 0
    WeekDaysStartsOn: string | ''
    WeeklyOff: string | ''
    WeeklyOff2: string | ''
    WeeklyOff2Type: string | ''
    NotApplicableForMonths: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateWeekOffMasterRequest {
    WeekOffPolicyMasterId: number | 0
    Uniquekey: string | null
    WeekOffPolicyCode: string | ''
    WeekOffPolicyName: string | ''
    WeekDays: number | 0
    WeekDaysStartsOn: string | ''
    WeeklyOff: string | ''
    WeeklyOff2: string | ''
    WeeklyOff2Type: string | ''
    NotApplicableForMonths: string | ''
}

export interface DeleteWeekOffMasterRequest {
    WeekOffPolicyMasterId: number
    UniqueKey: string
}

export type WeekOffMasterListResponse = ApiResponse<WeekOffMasterData[]>;
export type WeekOffMasterSaveResponse = ApiResponse<WeekOffMasterData[]>;
export type WeekOffMasterDeleteResponse = ApiResponse<number>;
