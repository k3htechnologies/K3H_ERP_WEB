import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInwardAndOutWardRequest {
    PageSize?: number
    PageNumber?: number
    InwardOutwardId?: number
    SenderName?: string
    SystemGeneratedCode?: string
    ReceiverName?: string
    DocumentType?: string
    DocumentTitle?: string;
    DeliveryStatus?: string;
    SenderMobileNumber?: string;
    ReceiverMobileNumber?: string;
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface InwardAndOutWardData {
    InwardOutwardId: number | 0,
    UniqueKey: string | null
    SystemGeneratedCode: string | null,
    DocumentTitle: string | null,
    InwardOutwardDate: string | null,
    DocumentType: string | null,
    EmployeeId: string | null,
    DocumentURL: string,
    Amount: number | 0,
    DeliveryType: string | null,
    AcknowledgementSignatureURL: string,
    AcknowledgementBy: string | null,
    ChequeNo: string | null,
    Priority: string | null,
    DocumentDescription: string | null,
    DeliveryMode: string | null,
    DeliveryStatus: string | null,
    AcknowledgementURL: string,
    AcknowledgementRemark: string | null,
    EmployeeNames: string | null
    InVoiceDate: string | null,
    DepartmentName: string | null,
    InwardNumber: number | 0,
    InVoiceNumber: number | 0,
    HandOverDate: string | null,
    HandOverTo: string | null,

    SenderName: string | null,
    SenderEmailId: string | null,
    SenderMobileNumber: string | null,
    SenderMobileNumberCountryCode: string | null
    SenderAddress: string | null,

    ReceiverName: string | null,
    ReceiverEmailId: string | null,
    ReceiverMobileNumber: string | null
    ReceiverMobileNumberCountryCode: string | null
    ReceiverAddress: string | null

    InwardOutwardRevertHistory: InwardOutwardRevertHistory[];

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
    DocumentURL: File[] | null,
    RemoveDocumentURL: string | ''
    Amount: number | 0,
    DeliveryType: string | null,
    AcknowledgementSignatureURL: File[] | null,
    RemoveAcknowledgementSignatureURL: string | ''
    AcknowledgementBy: string | null,
    ChequeNo: string | null,
    Priority: string | null,
    DocumentDescription: string | null,
    DeliveryMode: string | null,
    DeliveryStatus: string | null,
    AcknowledgementURL: File[] | null,
    RemoveAcknowledgementURL: string | ''
    AcknowledgementRemark: string | null,
    EmployeeNames: string | null
    InVoiceDate: string | null,
    InwardNumber: number | 0,
    InVoiceNumber: number | null,
    HandOverDate: string | null,
    HandOverTo: string | null,

    SenderName: string | null,
    SenderEmailId: string | null,
    SenderMobileNumber: string | null,
    SenderMobileNumberCountryCode: string | null
    SenderAddress: string | null,

    ReceiverName: string | null,
    ReceiverEmailId: string | null,
    ReceiverMobileNumber: string | null
    ReceiverMobileNumberCountryCode: string | null
    ReceiverAddress: string | null
}

export interface DeleteInwardAndOutWardRequest {
    UniqueKey: string
    InwardOutwardId: number
}

export interface InwardOutwardRevertHistory {
    InwardOutwardRevertId: number
    InwardOutwardId: number
    UniqueKey: string | null
    RevertDate: string | null
    RevertRemark: string | null
    RevertDocumentURL: string | null
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
    PageSize?: number
    PageNumber?: number
    MobileNumber?: string
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