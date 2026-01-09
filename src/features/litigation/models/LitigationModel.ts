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

export interface DeleteLitigationRequest {
    LitigationId: number
    Uniquekey: string
    ProjectId: number
}

export interface FilterWithPaginationLitigationHearingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    LitigationId?: number
    LitigationHearingId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}


export interface LitigationHearingData {
    LitigationHearingId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    HearingDate: string | ''
    HearingAttachementURL: string | ''
    Remark: string | ''
}

export interface AddUpdateLitigationHearingRequest {
    LitigationHearingId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    HearingDate: string | ''
    HearingAttachementURL: string | null
    RemoveHearingAttachementURL: string | ''
    Remark: string | ''
}

export interface DeleteLitigationHearingRequest {
    LitigationHearingId: number
    Uniquekey: string
    LitigationId: number
    ProjectId: number
}

export interface FilterWithPaginationLitigationClosureRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    LitigationId?: number
    LitigationClosureId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface LitigationClosureData {
    LitigationClosureId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    ClosureDate: string | ''
    ClosureAttachementURL: string | ''
    Remark: string | ''
    Conclusion: string | ''
}

export interface AddUpdateLitigationClosureRequest {
    LitigationClosureId: number | 0
    Uniquekey: string | null
    LitigationId: number | 0
    ProjectId: number | 0
    ClosureDate: string | ''
    ClosureAttachementURL: string | null
    RemoveClosureAttachementURL: string | ''
    Remark: string | ''
    Conclusion: string | ''
}

export type LitigationListResponse = ApiResponse<LitigationData[]>;
export type LitigationSaveResponse = ApiResponse<LitigationData[]>;
export type LitigationDeleteResponse = ApiResponse<number[]>;

export type LitigationHearingListResponse = ApiResponse<LitigationHearingData[]>;
export type LitigationHearingSaveResponse = ApiResponse<LitigationHearingData[]>;
export type LitigationHearingDeleteResponse = ApiResponse<number[]>;

export type LitigationClosureListResponse = ApiResponse<LitigationClosureData[]>;
export type LitigationClosureSaveResponse = ApiResponse<LitigationClosureData[]>;

