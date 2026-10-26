import type { ApiResponse } from "@/core/api/ApiResponse"

export interface CrmDashboardModel {
    Table0: Table0[]
    Table1: Table1[]
    Table2: Table2[]
    Table3: Table3[]
    Table4: Table4[]
    Table5: Table5[]
}

export interface Table0 {
    TotalAgreementAmount: number
    TotalAgreementGSTAmount: number
    TotalAgreementTDSAmount: number
    TotalReceivedAgreementAmount: number
    TotalOutstandingAgreementValue: number

    TotalBooking: number
    NonRegisteredBooking: number
    RegisteredBooking: number
    UpcomingRegistration: number
    TotalCollection: number
    CollectionAgreementReceived: number
    CollectionGST: number
    CollectionTDS: number
    TotalBrokerageAmount: number
    PaidBrokerageAmount: number
    OutstandingBrokerageAmount: number
    TotalChannelPartner: number
}
export interface Table1 {
    BrokerageAmount: number
    ChannelPartnerName: string
}

export interface Table2 {
    SystemGeneratedCode: string
    ApplicantName: string
    AgreementValue: number
    CreatedDate: string
    Flat: string
    SalesAdvisor: string
    SourcingManager: string
}

export interface Table3 {
    ApplicantName: string
    ReceivedAmount: number
    Flat: string
    TransactionChequeDemandDraftNumber: string
    PaymentFor: string
    PaymentMode: string
    CreatedDate: string
    ApprovalStatus: string
}

export interface Table4 {
    Name: string
    TotalCount: number
    ApprovedCount: number
    PendingCount: number
}

export interface Table5 {
    Days: number
    Title: string
    Description: string
}

export type CrmDashboardResponse = ApiResponse<CrmDashboardModel>;
export type CrmMilestoneCollectionResponse = ApiResponse<string>;