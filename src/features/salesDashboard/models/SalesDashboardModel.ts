import type { ApiResponse } from "@/core/api/ApiResponse";
export interface SalesDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
}

export interface Table0 {
     SystemGeneratedCode: string | null
    ProjectName: string | null
    MobileNumber: string | null
    Name: string | null
    EnquiryDate: string | null
    EnquiryTimeIn: string | null
    SalesAdvisor: string | null
    SourcingManager: string | null
    CanTimeOut:boolean |false
    EnquiryId: number | 0
}

export interface Table1 {
    SystemGeneratedCode: string | null
    ProjectName: string | null
    MobileNumber: string | null
    Name: string | null
    EnquiryFollowUpDays: string | null
    FinalStage: string | null
    NextFollowUpDate: string | null
    SalesAdvisor: string | null
    SourcingManager: string | null
    CreatedDate: string | null
}

export interface EnquiryOutTimeData {
    EnquiryId: number | 0
    ProjectId: number | 0
}

export interface UpdateEnquiryOutTimeRequest {
    EnquiryId: number | 0
    ProjectId: number | 0
}

export type SalesDashboardDatasetResponse = ApiResponse<SalesDashboardDataset>;
export type EnquiryOutTimeSaveResponse = ApiResponse<EnquiryOutTimeData[]>;
