import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationApprovedBankFolderRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ApprovedBankFolderId?: number
    BankName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ApprovedBankFolderData {
    ProjectId: number | null
    Uniquekey: string | null
    ApprovedBankFolderId: number
    BankListMasterId: string | null 
    BankName: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}
export interface AddUpdateApprovedBankFolderRequest {
    ApprovedBankFolderId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0
    BankListMasterId: string | null
}

export interface DeleteApprovedBankFolderRequest {
    ApprovedBankFolderId: number
    Uniquekey: string
    ProjectId: number
}

export type ApprovedBankFolderListResponse = ApiResponse<ApprovedBankFolderData[]>;
export type ApprovedBankWithFolderSaveResponse = ApiResponse<ApprovedBankFolderData[]>;
export type ApprovedBankWithFolderDeleteResponse = ApiResponse<number>