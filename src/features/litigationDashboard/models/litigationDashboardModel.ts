import type { ApiResponse } from "@/core/api/ApiResponse";

export interface LitigationDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
    Table2: Table2[];
    Table3: Table3[];
    Table4: Table4[];
    Table5: Table5[];
    Table6: Table6[];
}

export interface Table0 {
    TotalCases: number | 0
    OpenCases: number | 0
    ClosedCases: number | 0
    ReOpenCases: number | 0
}

export interface Table1 {
    TotalHearings: number | 0
}

export interface Table2 {
    CaseType: string | null
    TotalCases: number | 0
}

export interface Table3 {
    CourtType: string | null
    OpenCases: number | 0
    TotalCases: number | 0
}

export interface Table4 {
    ProjectName:string | null
    Title: string | null
    CaseNumber: number | 0
    CaseType: string | null
    HearingDate: string | null
    Status: string | null
}

export interface Table5 {
    ProjectName:string | null
    CaseNumber: number | 0
    CaseType: string | null
    CourtType: string | null
    HearingDate: string | null
    DaysRemaining: number | 0
}


export interface Table6 {
    MonthName: string | null
    MonthNumber: number | 0
    TotalCases: number | 0
    OpenCases: number | 0
    ClosedCases: number | 0
}

export type LitigationDashboardDatasetResponse = ApiResponse<LitigationDashboardDataset>;
