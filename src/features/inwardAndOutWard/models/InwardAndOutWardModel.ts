import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInwardAndOutWardRequest {
    PageSize?: number
    PageNumber?: number
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface InwardAndOutWardData {
    DocumentId: number | 0,
    Type: string | null,
    Title: string | null,
    Status: string | null,
    Priority: string | null,
    AssignedTo: string | null
    InvoiceDate: string | null,
    SenderName: string | null,
    SenderEmail: string | null,
    SenderContactNumber: string | null,
    senderAddress: string | null,
    Amount: number | 0,
    DeliveryMode: string | null,

    ReceiverName: string | null,
    ReceiverEmail: string | null,
    ReceiverContactNumber: string | null
    ReceiverAddress: string | null

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null

}

export interface AddUpdateInwardAndOutWardRequest {
    DocumentId: number | 0,
    Uniquekey: string | null
    Type: string | null,
    Title: string | null,
    Status: string | null,
    Priority: string | null,
    AssignedTo: string | null
    InvoiceDate: string | null,
    Amount: number | 0,
    DeliveryMode: string | null,

    SenderName: string | null,
    SenderEmail: string | null,
    SenderContactNumber: string | null,
    senderAddress: string | null,

    ReceiverName: string | null,
    ReceiverEmail: string | null,
    ReceiverContactNumber: string | null
    ReceiverAddress: string | null
}

export interface DeleteInwardAndOutWardRequest {
    Uniquekey: string

}

export type InwardAndOutWardListResponse = ApiResponse<InwardAndOutWardData[]>
export type InwardAndOutWardSaveResponse = ApiResponse<InwardAndOutWardData[]>
export type InwardAndOutWardDeleteResponse = ApiResponse<number>