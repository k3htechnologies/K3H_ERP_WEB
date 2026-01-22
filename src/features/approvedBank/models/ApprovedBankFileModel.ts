import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationApprovedBankFileRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ApprovedBankFolderId?: number
    ApprovedBankFileId?: number
    ApprovedBankFileName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ApprovedBankFileData {
    ApprovedBankFolderId: number | null
    Uniquekey: string | null
    ApprovedBankFileId: number | null
    ApprovedBankFileName: string | null
    ProjectId: number | null
    ApprovedBankFileURL: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateApprovedBankFileRequest {
    ApprovedBankFileId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    ApprovedBankFolderId: number | 0
    ApprovedBankFileName: string | null
    ApprovedBankFileURL: string | null
    RemoveApprovedBankFileURL: string | null
}

export interface DeleteApprovedBankFileRequest {
    ApprovedBankFileId: number | null
    ApprovedBankFolderId: number | null
    Uniquekey: string
    ProjectId: number | null
}

export type ApprovedBankFileListResponse = ApiResponse<ApprovedBankFileData[]>;
export type ApprovedBankFileSaveResponse = ApiResponse<ApprovedBankFileData[]>;
export type ApprovedBankFileDeleteResponse = ApiResponse<number>