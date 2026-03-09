import type { ApiResponse } from "@/core/api/ApiResponse"


export interface FilterWithPaginationClassificationParameter {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsCheckPermission?: boolean
    ClassificationParameterId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
    VillageName?: string
}

export interface ClassificationParameterData {
    ClassificationParameterId?: number | 0,
    Uniquekey: string,
    ProjectId: number | 0,
    PossessionType?: string
    Requirement?: string
    RequirementType?: string
    MinBudget?: string | null;
    VillageMasterId: string | null;
    VillageName?: string
    TimeLine?: string;
    CreatedBy?: string;
    CreatedDate?: string;
    ModifiedBy?: string;
    ModifiedDate?: string;
}

export interface AddUpdateClassificationParameterRequest {
    ClassificationParameterId?: number;
    ProjectId: number;
    MinBudget?: string;
    PossessionType?: string;
    Requirement?: string;
    RequirementType?: string;
    TimeLine?: string;
    Uniquekey: string,
    VillageMasterId: string | null;
}

export interface DeleteClassificationParameterRequest {
    ClassificationParameterId: number
    ProjectId: number
    Uniquekey: string
}

export type ClassificationParameterListResponse = ApiResponse<ClassificationParameterData[]>;
export type ClassificationParameterSaveReponse = ApiResponse<ClassificationParameterData[]>;
export type ClassificationParameterDeleteResponse = ApiResponse<number>;