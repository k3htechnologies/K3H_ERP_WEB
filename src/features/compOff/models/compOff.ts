import type { ApiResponse } from '@/core/api/ApiResponse';

export interface CompOffData{
    CompOffId:number,
    Uniquekey:string,
    CompOffDate:string,
    RequestDate :string,
    Reason:string,
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateCompOff{
    CompOffId?: number | null,
    Uniquekey?: string | null,
    CompOffDate?: string | null,
    RequestDate?: string | null,
    Reason?: string | null

}
export interface FilterWithPaginationCompOff{
    PageSize: number
    PageNumber: number
    CompOffId?: number
    StartDate?: string
    EndDate?: string
    Reason?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DeleteCompOffRequest {
    CompOffId?: number | null
    Uniquekey?: string | null
}

export type CompOffListResponse = ApiResponse<CompOffData[]>;
export type CompOffSaveResponse = ApiResponse<CompOffData[]>;
export type CompOffDeleteResponse = ApiResponse<number>;