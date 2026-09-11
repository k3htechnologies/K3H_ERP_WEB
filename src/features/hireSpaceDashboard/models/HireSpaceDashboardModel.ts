import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterHireSpaceDashboardRequest {
    ExportType?: 'Excel' | 'PDF'
}

export interface HireSpaceDashboardModel {
    Table0: Table0[]
    Table1: Table1[]
    Table2: Table2[]
    Table3: Table3[]
    Table4: Table4[]
    Table5: Table5[]
}

export interface Table0 {
    TotalJobRoles: number | 0
    ActiveOpenings: number | 0
    TotalPositions: number | 0
    FilledPositions: number | 0
    RemainingPositions: number | 0
    TotalCandidates: number | 0
    ActiveCandidates: number | 0
}

export interface Table1 {
    StageId: number | 0
    StageName: string | null
    CandidateCount: number | 0
    DisplayOrder: number | 0
}

export interface Table2 {
    DepartmentMasterId: number | 0
    DepartmentName: string | null
    CandidateCount: number | 0
}

export interface Table3 {
    JobOpeningMasterId: number | 0
    JobRole: string | null
    Department: string | null
    Openings: number | 0
    Filled: number | 0
    Remaining: number | 0
    Applications: number | 0
    OpeningAgeDays: number | 0
    CreatedDate: string | null
}

export interface Table4 {
    InterviewId: number | 0
    CandidateName: string | null
    MobileNo: string | null
    Email: string | null
    InterviewPanel: string | null
    JobRole: string | null
    Stage: string | null
    InterviewDate: string | null
    InterviewTime: string | null
    Remarks: string | null
}

export interface Table5 {
    JobOpeningMasterId: number | 0
    JobRole: string | null
    Department: string | null
    TotalOpenings: number | 0
    Filled: number | 0
    PositionsRemaining: number | 0
    Applications: number | 0
    OpeningAgeDays: number | 0
    Status: string | null
}

export type HireSpaceDashboardResponse = ApiResponse<HireSpaceDashboardModel>;
