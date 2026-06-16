import type { ApiResponse } from "@/core/api/ApiResponse";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";

export interface SalesDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
    Table4: Table4[];
    Table5: ProjectAchievementData[];
    Table6: Table6[];
    Table7: Table7[];
    Table8:Table8[];
}

export interface Table0 {
    SystemGeneratedCode: string | null
    ProjectName: string | null
    ProjectId: number | 0
    MobileNumberCountryCode: string | null
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
    ProjectId: number | 0
    MobileNumberCountryCode: string | null
    MobileNumber: string | null
    Name: string | null
    EnquiryFollowUpDays: string | null
    FinalStage: string | null
    NextFollowUpDate: string | null
    SalesAdvisor: string | null
    SourcingManager: string | null
    CreatedDate: string | null
    IsAction:boolean |false
}


export interface Table4 {
  TotalEmployees: number | null;
  PresentCount: number | null;
  OnLeaveCount: number | null;
  AbsentCount: number | null;

}

export interface Table6 {
    SystemGeneratedCode: string
    ApplicantName: string
    AgreementValue: number
    CreatedDate: string
    Flat: string
    ProjectName: string
    SalesAdvisor: string
    SourcingManager: string
}

export interface Table7 {
  Name: string | null;
  Department: string | null;
  DesignationName: string | null;
  EmployeeCode: string | null;
  Status: string | null;
  PunchIn: string | null;
  PunchOut: string | null;
  EmailId: string | null;
}

export interface Table8{
    AgreementValue: number;
    Name: string | null;
    TotalBooking: number;
    Department: string | null;
    TotalOBM:number;
    WalkinsByCP:number;
    ProfilePhotoURL:string;
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
