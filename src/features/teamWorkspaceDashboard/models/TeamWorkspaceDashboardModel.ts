import type { ApiResponse } from "@/core/api/ApiResponse"

export interface TeamWorkspaceDashboardDataset {
    Table0: Table0[]
    Table1: Table1[]
    Table2: Table2[]
    Table3: Table3[]
    Table4: Table4[]
    Table5: Table5[]
    Table6: Table6[]
    Table7: Table7[]
}

export interface Table0 {
    TaskId: number | 0
    TaskTitle: string | null
    TaskDescription: string | null
    Status: string | null
    Priority: string | null
    StartDate: string | null
    DueDate: string | null
}

export interface Table1 {}

export interface Table2 {}

export interface Table3 {
    TotalRooms: number | 0
    AvailableRooms: number | 0
}

export interface Table4 {}

export interface Table5 {
    TotalTasks: number | 0
    InProgressTasks: number | 0
    PendingTasks: number | 0
    CompletedTasks: number | 0
}

export interface Table6 {}

export interface Table7 {}

export type TeamWorkspaceDashboardResponse = ApiResponse<TeamWorkspaceDashboardDataset>
