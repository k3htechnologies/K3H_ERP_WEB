import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationHolidayMappingMasterRequest {
    PageSize: number
    PageNumber: number
    HolidayMappingMasterId?: number
    BranchName?: string
    HolidayName?: string
    FromHolidayDate?: string
    ToHolidayDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface HolidayMappingMasterData {
    HolidayMappingMasterId: number | 0
    Uniquekey: string | null
    HolidayMasterId: number | 0
    HolidayName: string | ''
    HolidayDate: string | null
    BranchName: string | ''
    BranchMasterId: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateHolidayMappingMasterRequest {
    HolidayMappingMasterId: number | 0
    Uniquekey: string | null

    HolidayMasterId: number | 0
    BranchMasterId: string | ''

    HolidayDate: string | null
}

export interface DeleteHolidayMappingMasterRequest {
    HolidayMappingMasterId: number
    UniqueKey: string
}

export type HolidayMappingMasterListResponse = ApiResponse<HolidayMappingMasterData[]>;
export type HolidayMappingMasterSaveResponse = ApiResponse<HolidayMappingMasterData[]>;
export type HolidayMappingMasterDeleteResponse = ApiResponse<number>;
