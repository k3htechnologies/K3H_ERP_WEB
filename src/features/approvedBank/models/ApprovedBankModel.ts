import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationApprovedBankWithFolderRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ApprovedBankFolderId?: number
    BankName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ApprovedBankWithFolderData {
    ProjectId: number | null
    Uniquekey: string | null
    ApprovedBankFolderId: number
    BankListMasterId: number 
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
export interface AddUpdateApprovedBankWithFolderRequest {
    ApprovedBankFolderId: number | 0,
    Uniquekey: string | null
    ProjectId: number | 0
    BankListMasterId: number | 0
}

export interface DeleteApprovedBankWithFolderRequest {
    ApprovedBankFolderId: number
    Uniquekey: string
    ProjectId: number
}

export type ApprovedBankFolderListResponse = ApiResponse<ApprovedBankWithFolderData[]>;
export type ApprovedBankWithFolderSaveResponse = ApiResponse<ApprovedBankWithFolderData[]>;
export type ApprovedBankWithFolderDeleteResponse = ApiResponse<number>