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
    TotalHearings: number | 0
}

export interface Table1 {
    TotalHearings: number | 0
}

export interface Table1 {
    TotalCases: number | 0
    CivilCases: number | 0
    CriminalCases: number | 0
}

export interface Table2 {
    CaseType: number | 0
    TotalCases:number | 0
}

export interface Table3 {
    Title: string | null
    CaseNumber: number | 0
    CaseType: string | null
    HearingDate: string | null
    Status: string | null
}

export interface Table4 {
    CaseNumber: number | 0
    CaseType: string | null
    CourtType: string | null
    Location: string | null
    HearingDate: string | null
}

export interface Table5 {
    OpenCases: number | 0
    ClosedCases: number | 0
}

export interface Table6 {
    CaseNumber: number | 0
    DocumentName: string | null

}
export type LitigationDashboardDatasetResponse = ApiResponse<LitigationDashboardDataset>;
