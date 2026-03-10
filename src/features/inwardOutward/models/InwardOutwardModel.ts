import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationInwardOutwardRequest {
    PageSize: number
    PageNumber: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
    DeliveryType?: string
}

export interface InwardOutwardData {
    InwardOutwardId: number
    UniqueKey: string
    DeliveryType: string
    InwardOutwardDate: string
    SenderName: string
    SenderAddress: string
    SenderMobileNo: string
    ReceiverName: string
    ReceiverAddress: string
    ReceiverMobileNo: string
    DocumentURL: string
    EmployeeNames: string
    ReceiversRemark: string
    CourierMode: string
    InwardOutwardStatus: string
    AcknowledgementURL: string
    ReceptionalRemark: string
    CreatedById: number
    CreatedBy: string
    CreatedDate: string
    ModifiedById: number
    ModifiedBy: string
    ModifiedDate: string
}


export interface AddUpdateInwardOutwardRequest {
    InwardOutwardId?: number
    UniqueKey?: string
    DeliveryType: string
    InwardOutwardDate: string
    SenderName: string
    SenderAddress: string
    SenderMobileNo: string
    ReceiverName: string
    ReceiverAddress: string
    ReceiverMobileNo: string
    DocumentURL?: string
    EmployeeNames: string
    ReceiversRemark?: string
    CourierMode: string
    InwardOutwardStatus: string
    AcknowledgementURL?: string
    ReceptionalRemark?: string
}

export interface DeleteInwardOutwardRequest {
    InwardOutwardId: number
    UniqueKey: string
}

export type InwardOutwardListResponse = ApiResponse<InwardOutwardData[]>;
export type InwardOutwardReponse = ApiResponse<InwardOutwardData[]>;
export type InwardOutwardDeleteResponse = ApiResponse<number>;
