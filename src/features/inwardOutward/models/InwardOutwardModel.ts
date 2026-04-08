import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInwardAndOutWardRequest {
    PageSize?: number
    PageNumber?: number
    InwardOutwardId?: number
    SenderName?: string
    ReceiverName?: string
    DeliveryType?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface InwardAndOutWardData {
    InwardOutwardId: number | 0,
    UniqueKey: string | null
    DocumentTitle: string | null,
    InwardOutwardDate: string | null,
    DocumentType: string | null,
    EmployeeId: string | null,
    DocumentURL: string | null,
    Amount: number | 0,
    DeliveryType: string | null,
    ReceiversSignature: string | null,
    ReceivedBy: string | null,
    ChequeNo: string | null,
    Priority: string | null,
    DocumentDescription: string | null,
    DeliveryMode: string | null,
    DeliveryStatus: string | null,
    AcknowledgementURL: string | null,
    AcknowledgementRemark: string | null,
    EmployeeNames: string | null
    InvoiceDate: string | null,
    DepartmentName: string | null,
    InwardNumber: number | 0,
    InvoiceNumber: number | 0,
    HandOverDate: string | null,
    HandOverTo: string | null,

    RevertedInwardOutwardId: number | 0,
    InwardOutwardRevertDate: string | null
    RevertRemark: string | null
    RevertDocumentURL: string | null

    SenderName: string | null,
    SenderEmailId: string | null,
    SenderMobileNo: string | null,
    SenderAddress: string | null,

    ReceiverName: string | null,
    ReceiverEmailId: string | null,
    ReceiverMobileNo: string | null
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
    InwardOutwardId: number | 0,
    UniqueKey: string | null
    DocumentTitle: string | null,
    InwardOutwardDate: string | null,
    DocumentType: string | null,
    EmployeeId: string | null,
    DocumentURL: string | null,
    RemoveDocumentURL: string | ''
    Amount: number | 0,
    DeliveryType: string | null,
    ReceiversSignature: string | null,
    RemoveReceiversSignature: string | ''
    ReceivedBy: string | null,
    ChequeNo: string | null,
    Priority: string | null,
    DocumentDescription: string | null,
    DeliveryMode: string | null,
    DeliveryStatus: string | null,
    AcknowledgementURL: string | null,
    RemoveAcknowledgementURL: string | ''
    AcknowledgementRemark: string | null,
    EmployeeNames: string | null
    InVoiceDate: string | null,
    InwardNumber: number | 0,
    InVoiceNumber: number | 0,
    HandOverDate: string | null,
    HandOverTo: string | null,

    SenderName: string | null,
    SenderEmailId: string | null,
    SenderMobileNo: string | null,
    SenderAddress: string | null,

    ReceiverName: string | null,
    ReceiverEmailId: string | null,
    ReceiverMobileNo: string | null
    ReceiverAddress: string | null
}

export interface DeleteInwardAndOutWardRequest {
    UniqueKey: string
    InwardOutwardId: number

}

export interface AddRevertInwardOutwardData {
    InwardOutwardRevertId: number | 0,
    InwardOutwardId: number | 0,
    UniqueKey: string | null
    RevertDate: string | null
    RevertRemark: string | null
    RevertDocumentURL: string | null
}

export interface FilterWithPaginationSenderReceiverByMobileNoRequest {
    PageSize: number
    PageNumber: number
    MobileNumber?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface SenderReceiverByMobileNoData {
    MobileNumber: string | null
    Name: string | null,
    EmailId: string | null,
    Address: string | null,
}

export type InwardAndOutWardListResponse = ApiResponse<InwardAndOutWardData[]>
export type InwardAndOutWardSaveResponse = ApiResponse<InwardAndOutWardData[]>
export type InwardAndOutWardDeleteResponse = ApiResponse<number>
export type InwardOutwardRevertSaveResponse = ApiResponse<AddRevertInwardOutwardData[]>

export type SenderReceiverByMobileNoDataListResponse = ApiResponse<SenderReceiverByMobileNoData[]>