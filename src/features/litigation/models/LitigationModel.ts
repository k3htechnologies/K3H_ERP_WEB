import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationLitigationRequest {
    PageSize: number
    PageNumber: number
    LitigationId?: number
    ProjectId?: number
    CaseNumber?: string
    Title?: string
    CourtName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LitigationData {
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    Title: string | ''
    CaseNumber: string | ''
    CaseType: string | ''
    DateOfFilling: string | ''
    ClosureDate: string | ''
    HearingDate: string | ''
    CourtName: string | ''
    CourtLocation: string | ''
    CourtType: string | ''
    Plantiff: string | ''
    Defendant: string | ''
    Status: string | ''
    AssignedRepresentative: string | ''
    OpposingRepresentative: string | ''
    Remark: string | ''
    CaseBrief: string | ''
    AddUpdateLitigationDocuments: string | ''
    ProjectName: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateLitigationRequest {
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    Title: string | ''
    CaseNumber: string | ''
    CaseType: string | ''
    DateOfFilling: string | ''
    CourtName: string | ''
    CourtLocation: string | ''
    CourtType: string | ''
    Plantiff: string | ''
    Defendant: string | ''
    AssignedRepresentative: string | ''
    OpposingRepresentative: string | ''
    Remark: string | ''
    CaseBrief: string | ''
}

export interface LitigationReopenData {
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
}

export interface UpdateLitigationReopenRequest {
    LitigationId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
}

export interface DeleteLitigationRequest {
    LitigationId: number
    Uniquekey: string
    ProjectId: number
}

export type LitigationListResponse = ApiResponse<LitigationData[]>;
export type LitigationSaveResponse = ApiResponse<LitigationData[]>;
export type LitigationReopenSaveResponse = ApiResponse<LitigationReopenData[]>;
export type LitigationDeleteResponse = ApiResponse<number[]>;

