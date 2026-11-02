import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithConstructionAreaComparativeRequest {
    ProjectId?: number
    Type?: string
    ConstructionAreaComparativeId?: number
    IsCheckPermission?: boolean
    ExportType?: 'Excel' | 'PDF'
}

export interface ConstructionAreaComparativeData {
    ConstructionAreaComparativeId: number | 0
    Uniquekey: string | null
    ProjectId :number;
    Type: string | ''
    AreaByPLLineSqMt:number | 0
    VariationInPercentage:number | 0
    Remark:string;
    AnnexureURL: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateConstructionAreaComparativeRequest {
    ConstructionAreaComparativeId: number | 0
    Uniquekey: string | null
    ProjectId :number;
    AreaByPLLineSqMt: number | ''
    Remark:string;
    AnnexureURL: (File | string)[] | null;
    RemoveAnnexureURL: string | ''
}


export type ConstructionAreaComparativeListResponse = ApiResponse<ConstructionAreaComparativeData[]>;
export type ConstructionAreaComparativeSaveResponse = ApiResponse<ConstructionAreaComparativeData[]>;
