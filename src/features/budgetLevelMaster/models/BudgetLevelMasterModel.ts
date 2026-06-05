import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationBudgetLevelMasterRequest {
    PageSize: number;
    PageNumber: number;
    ProjectId?: number;
    BudgetLevelMasterId?: number
    LevelType?: string;
    CategoryName?: string;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface BudgetLevelMasterData {
    BudgetLevelMasterId: number | 0
    UniqueKey: string | null
    ProjectId: number | 0
    CategoryName: string | null
    UomMasterId: number | 0
    Uom: string | null
    LevelType: string | null
    Level1Name: string | null
    Level2Name: string | null
    Level3Name: string | null
    Level4Name: string | null
    LevelId1: number | 0
    LevelId2: number | 0
    LevelId3: number | 0
    LevelId4: number | 0
    OrderBy: number | 0
    WBSCode: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateBudgetLevelMaster {
    BudgetLevelMasterId: number | 0
    Uniquekey: string | null
    ProjectId: number | 0
    CategoryName: string | null
    UomMasterId: number | 0
    LevelId1: number | 0
    LevelId2: number | 0
    LevelId3: number | 0
    LevelId4: number | 0
    OrderBy: number | 0
}

export interface DeleteBudgetLevelMasterRequest {
    BudgetLevelMasterId: number
    UniqueKey: string
    ProjectId: number
}

export type BudgetLevelMasterListResponse = ApiResponse<BudgetLevelMasterData[]>;
export type BudgetLevelMasterSaveResponse = ApiResponse<BudgetLevelMasterData[]>;
export type DeleteBudgetLevelMasterResponse = ApiResponse<number[]>;