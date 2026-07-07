import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBrokerageBookingRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    ChannelPartnerName?: string
    ChannelPartnerCompanyName?: string | null
    ChannelPartnerMobileNumber?: string | null
    ApplicantName?: string
    ApplicantMobileNumber?: string
    FromDate?: string
    ToDate?: string
    Wing?: string
    Flat?: string
    Floor?: string
    Source?: string
    AgreementValue?: number
    BookingType?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BrokerageBookingData {
    ProjectId: number | 0
    BookingId: number | 0
    SystemGeneratedCode: string | null
    ApplicantMobileNumber: number | 0
    ApplicantMobileNumberCountryCode: string | null
    ChannelPartnerName: string | null
    ChannelPartnerCompany: string | null
    ChannelPartnerMobileNumber: string | null
    ChannelPartnerMobileNumberCountryCode: string | null
    ApplicantName: string | null
    FromDate: string | null
    ToDate: string | null
    Wing: string | null
    Flat: string | null
    Floor: string | null
    Source: string | null
    AgreementValue: number | 0
    BrokerageAmount: number | 0
    BrokeragePercentage: number | 0
    InvoiceAmount: number | 0
    PaymentPaidAmount: number | 0
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
    InvoiceNumber?:string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BrokerageInvoiceData {
    BrokerageInvoiceId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    BookingId: number | 0
    InvoiceNumber: string | ''
    InvoiceDate: string | null
    UploadInvoiceURL: string
    BankListMasterId: number | 0
    AccountName: string | null
    AccountNumber: string 
    IFSCCode: string | null
    InvoiceAmount: number | 0
    PaymentAmount: number | 0
    DueDate: string | null
    Remark: string | null
    BankName: string | null
    ApprovalStatus: string;
    IsApproval: boolean;
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
    InvoiceNumber: string| ''
    InvoiceDate: string | ''
    UploadInvoiceURL: string | null
    RemoveUploadInvoiceURL: string | ''
    BankListMasterId: number | 0
    BankName: string | ''
    AccountName: string | ''
    AccountNumber: string 
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