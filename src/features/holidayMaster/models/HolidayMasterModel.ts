import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationHolidayMasterRequest {
    PageSize: number
    PageNumber: number
    HolidayMasterId?: number
    HolidayName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface HolidayMasterData {
    HolidayMasterId: number | 0
    Uniquekey: string | null
    HolidayName: string | ''
    HolidayURL: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateHolidayMasterRequest {
    HolidayMasterId: number | 0
    Uniquekey: string | null
    HolidayName: string | ''
    HolidayURL: File | null
    RemoveHolidayURL: string | ''
}

export interface DeleteHolidayMasterRequest {
    HolidayMasterId: number
    UniqueKey: string
}

export type HolidayMasterListResponse = ApiResponse<HolidayMasterData[]>;
export type HolidayMasterSaveResponse = ApiResponse<HolidayMasterData[]>;
export type HolidayMasterDeleteResponse = ApiResponse<number>;
