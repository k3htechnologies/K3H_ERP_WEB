import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBrokerageBookingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ApplicantMobileNumber?: string
    ChannelPartnerName?: string
    ApplicantName?: string
    FromDate?: string
    ToDate?: string
    Wing?: string
    Flat?: string
    Floor?: string
    Source?: string
    AgreementValue?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BrokerageBookingData {
    ProjectId: number | 0
    BookingId: number | 0
    ApplicantMobileNumber: number | 0
    ChannelPartnerName: string | null
    ApplicantName: string | null
    FromDate: string | null
    ToDate: string | null
    Wing: string | null
    Flat: string | null
    Floor: string | null
    Source: string | null
    AgreementValue: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface FilterWithPaginationBrokerageInvoiceRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    BookingId?: number
    BrokerageInvoiceId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BrokerageInvoiceData {
    ProjectId: number | 0
    Uniquekey: string | null
    BookingId: number | 0
    BrokerageInvoiceId: number | 0
    InvoiceNumber: number | 0
    InvoiceDate: string | null
    UploadInvoiceURL: string | null
    RemoveUploadInvoiceURL: string | ''
    BankListMasterId: number | 0
    AccountName: string | null
    AccountNumber: number | 0
    IFSCCode: string | null
    InvoiceAmount: number | 0
    DueDate: string | null
    Remark: string | null
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

export interface AddUpdateBrokerageInvoiceRequest {
    ProjectId: number | 0
    Uniquekey: string | null
    BookingId: number | 0
    BrokerageInvoiceId: number | 0
    InvoiceNumber: number | 0
    InvoiceDate: string | ''
    UploadInvoiceURL: string | null
    RemoveUploadInvoiceURL: string | ''
    BankListMasterId: number | 0
    BankName: string | ''
    AccountName: string | ''
    AccountNumber: number | 0
    IFSCCode: string | ''
    InvoiceAmount: number | 0
    DueDate: string | ''
    Remark: string | ''
}

export interface DeleteBrokerageInvoiceRequest {
    BrokerageInvoiceId: number
    BookingId: number
    Uniquekey: string
    ProjectId: number
}

export type BrokerageBookingListResponse = ApiResponse<BrokerageBookingData[]>;

export type BrokerageInvoiceListResponse = ApiResponse<BrokerageInvoiceData[]>;
export type BrokerageInvoiceSaveResponse = ApiResponse<BrokerageInvoiceData[]>
export type BrokerageInvoiceDeleteResponse = ApiResponse<number[]>