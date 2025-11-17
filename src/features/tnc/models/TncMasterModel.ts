import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTncMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    TermsAndConditionsMasterId?: number
    ModuleName?: string
    Title?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface TncMasterData {
    TermsAndConditionsMasterId: number | null;
    Uniquekey: string | null;
    ModuleName: string | null;
    Title: string | null;
    Description: string | null;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateTncMasterRequest {
    TermsAndConditionsMasterId: number | 0;
    Uniquekey: string | null;
    ModuleName: string | '';
    Title: string | '';
    Description: string | '';
}

export interface DeleteTncMasterRequest {
    TermsAndConditionsMasterId: number
    UniqueKey: string
}

export type TncMasterListResponse = ApiResponse<TncMasterData[]>;
export type TncMasterSaveResponse = ApiResponse<TncMasterData[]>;
export type TncMasterDeleteResponse = ApiResponse<number>;
