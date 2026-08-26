import type { ApiResponse } from '@/core/api/ApiResponse'

export interface FilterWithPaginationTermSheetDocumentRequest {

    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ProjectId?: number
    TermSheetId?: number
    TermSheetDetailsId?: number
    TermSheetDocumentId?: number
    DocumentName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface TermSheetDocumentData {

    TermSheetDocumentId: number| null;
    Uniquekey: string| null;

    ProjectId: number| null;
    TermSheetId: number| null;
    TermSheetDetailsId: number| null;   

    DocumentName: string | null
    DocumentURL: string | null
    RemoveDocumentURL: string | ''
    DocumentRemark?: string
    IsSubmittedOriginalDocument: boolean;
    IsCollectedOriginalDocument: boolean;
    CollectedOriginalDocumentDate: string | null

    CreatedById: number
    CreatedBy: string
    CreatedDate: string | null

    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string | null
}

export interface AddUpdateTermSheetDocumentRequest {

    TermSheetDocumentId?: number| null;
    Uniquekey?: string | null;
    TermSheetId: number | null;
    TermSheetDetailsId: number | null;
    ProjectId: number| null;
    DocumentName?: string | null
    DocumentURL?: File[] | null;
    RemoveDocumentURL?: string
    DocumentRemark?: string
    IsSubmittedOriginalDocument: boolean;
    IsCollectedOriginalDocument: boolean;
    CollectedOriginalDocumentDate: string | null
}

export interface DeleteTermSheetDocumentRequest {

    TermSheetDocumentId: number | null
    Uniquekey?: string| null
    ProjectId: number| null
    TermSheetId: number| null
    TermSheetDetailsId: number| null
}


export type TermSheetDocumentListResponse =  ApiResponse<TermSheetDocumentData[]>

export type TermSheetDocumentSaveResponse = ApiResponse<TermSheetDocumentData[]>

export type TermSheetDocumentDeleteResponse =  ApiResponse<number>