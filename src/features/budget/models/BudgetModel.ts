import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationBudgetRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    BudgetId?: number
    LevelType?: string;
    CategoryName?: string;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BudgetData {
    BudgetId: number | 0
    UniqueKey: string | null
    ProjectId: number | 0
    CategoryName: string | null
    UomMasterId: number | 0
    Uom: string | null
    LevelType: string | null
    LevelId1: number | 0
    Level1Name: string | null
    LevelId2: number | 0
    Level2Name: string | null
    LevelId3: number | 0
    Level3Name: string | null
    Floor: string | null
    InventoryFlatId: string | null
    Flat: string | null
    OrderBy: number | 0
    WBSCode: string | null
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
}

export interface AddUpdateBudget {
    BudgetId: number | 0
    ProjectId: number | 0
    UniqueKey: string | null
    LevelId1: number | 0
    LevelId2: number | 0
    LevelId3: number | 0
    OrderBy: number | 0
    UomMasterId: number | 0
    InventoryFlatId: string | null
    Quantity: number | 0
    LabourCost: number | 0
    MaterialCost: number | 0
    PMCost: number | 0
    BudgetAmount: number | 0
    Remark: string | null
}

export type BudgetListResponse = ApiResponse<BudgetData[]>;
export type BudgetSaveResponse = ApiResponse<BudgetData[]>;