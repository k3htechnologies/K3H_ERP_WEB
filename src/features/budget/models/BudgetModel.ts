import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationBudgetRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    BudgetLevelMasterId?: number
    LevelType?: string;
    CategoryName?: string;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BudgetData {
    BudgetLevelMasterId: number | 0
    BudgetId: number | 0
    UniqueKey: string | null
    ProjectId: number | 0
    CategoryName: string | null
    UomMasterId: number | 0
    WBSCode: string | null
    LevelName: string | null
    LevelID1: number | 0
    Level1Name: string | null
    LevelID2: number | 0
    Level2Name: string | null
    LevelID3: number | 0
    Level3Name: string | null
    LevelType: string | null
    LevelID4: number | 0
    Level4Name: string | null
    OrderBy: number | 0
    Quantity: number | 0
    LabourCost: number | 0
    MaterialCost: number | 0
    PMCost: number | 0
    TotalRate: number | 0
    BudgetAmount: number | 0
    Remark: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateBudget {
    BudgetLevelMasterId: number | 0
    BudgetId: number | 0
    ProjectId: number | 0
    Uniquekey: string | null
    Quantity: number | 0
    LabourCost: number | 0
    MaterialCost: number | 0
    PMCost: number | 0
    Remark: string | null
}

export type BudgetListResponse = ApiResponse<BudgetData[]>;
export type BudgetSaveResponse = ApiResponse<BudgetData[]>;