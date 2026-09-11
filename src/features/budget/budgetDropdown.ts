import * as E from "fp-ts/Either";
import type { BudgetData } from "@/features/budget/models/BudgetModel";
import { budgetService } from "@/features/budget/services/BudgetService";


export interface BudgetDropdownItem {
    label: string;
    value: string;
    LevelType: string;
    LevelId1: number;
    LevelId2: number;
    LevelId3: number;
    LevelId4: number;
    Level4MaterialName:string| null;
    Level4SubMaterialUomCode:string| null;
    Level4SubMaterialUom:string| null;
    Level4LeadTimeInDays: number | 0,
    Level4IsTolerant?: boolean,
    MaterialCost: number | 0,
    Quantity: number | 0
    ReceivedQuantity: number | 0
}

export const fetchProjectBudget = async ( projectId: number): Promise<BudgetData[]> => {

    try {

        if (!projectId || projectId === 0) {
            return [];
        }

        const responseEither =
            await budgetService.apiCallPullBudget({
                PageSize: 1000,
                PageNumber: 1,
                ProjectId: projectId
            });

        if (E.isLeft(responseEither)) {

            console.error("PULL PROJECT BUDGET API ERROR", responseEither.left);

            return [];
        }

        return responseEither.right?.Data ?? [];

    } catch (error) {

        console.error("FETCH PROJECT BUDGET ERROR",error);

        return [];
    }
};


// ============================================================
// L1 - CATEGORY
// ============================================================

export const getBudgetL1Dropdown = (budgetList: BudgetData[]): BudgetDropdownItem[] => {

    if (!budgetList?.length) {
        return [];
    }

    const unique = new Map<number, BudgetDropdownItem>();

    budgetList
        .filter(
            item =>
                item.LevelType === "L1" &&
                item.LevelId1 > 0
        )
        .forEach(item => {

            if (!unique.has(item.LevelId1)) {

                unique.set(item.LevelId1, {
                    label: item.Level1Name ??   item.CategoryName ??`Category ${item.LevelId1}`,

                    value: String(item.LevelId1),

                    LevelType: "L1",

                    LevelId1: item.LevelId1,
                    LevelId2: 0,
                    LevelId3: 0,
                    LevelId4: 0,
                    Level4MaterialName: null,
                    Level4SubMaterialUomCode: null,
                    Level4SubMaterialUom: null,
                    Level4LeadTimeInDays: 0,
                    Level4IsTolerant: false,
                    MaterialCost:0,
                    Quantity:0,
                    ReceivedQuantity:0
                });
            }
        });

    return Array.from(unique.values());
};


// ============================================================
// L2 - SUB CATEGORY
// ============================================================

export const getBudgetL2Dropdown = ( budgetList: BudgetData[], levelId1: number ): BudgetDropdownItem[] => {

    if ( !budgetList?.length || !levelId1 ||  levelId1 === 0 ) {
        return [];
    }

    const unique = new Map<number, BudgetDropdownItem>();

    budgetList
        .filter(
            item =>
                item.LevelType === "L2" &&
                item.LevelId1 === levelId1 &&
                item.LevelId2 > 0
        )
        .forEach(item => {

            if (!unique.has(item.LevelId2)) {

                unique.set(item.LevelId2, {
                    label: item.Level2Name ?? `Sub Category ${item.LevelId2}`,
                    value: String(item.LevelId2),
                    LevelType: "L2",
                    LevelId1: item.LevelId1,
                    LevelId2: item.LevelId2,
                    LevelId3: 0,
                    LevelId4: 0,
                    Level4MaterialName: null,
                    Level4SubMaterialUomCode: null,
                    Level4SubMaterialUom: null,
                    Level4LeadTimeInDays: 0,
                    Level4IsTolerant: false,
                    MaterialCost:0,
                    Quantity:0,
                    ReceivedQuantity:0
                });
            }
        });

    return Array.from(unique.values());
};


// ============================================================
// L3 - DESCRIPTION
// ============================================================

export const getBudgetL3Dropdown = ( budgetList: BudgetData[], levelId1: number, levelId2: number ): BudgetDropdownItem[] => {

    if (!budgetList?.length || !levelId1 || !levelId2 ) {
        return [];
    }

    const unique = new Map<number, BudgetDropdownItem>();

    budgetList
        .filter(
            item =>
                item.LevelType === "L3" &&
                item.LevelId1 === levelId1 &&
                item.LevelId2 === levelId2 &&
                item.LevelId3 > 0
        )
        .forEach(item => {

            if (!unique.has(item.LevelId3)) {

                unique.set(item.LevelId3, {
                    label: item.Level3Name ??`Description ${item.LevelId3}`,
                    value: String(item.LevelId3),
                    LevelType: "L3",
                    LevelId1: item.LevelId1,
                    LevelId2: item.LevelId2,
                    LevelId3: item.LevelId3,
                    LevelId4: 0,
                    Level4MaterialName: null,
                    Level4SubMaterialUomCode: null,
                    Level4SubMaterialUom: null,
                    Level4LeadTimeInDays: 0,
                    Level4IsTolerant: false,
                    MaterialCost:0,
                    Quantity:0,
                    ReceivedQuantity:0
                });
            }
        });

    return Array.from(unique.values());
};


// ============================================================
// L4 - MATERIAL
// ============================================================
//
// IMPORTANT:
// Your current BudgetData model does NOT have LevelId4.
// Therefore this function cannot safely read item.LevelId4 yet.
//
// Add LevelId4 / Level4Name to BudgetData if apiCallPullBudget
// actually returns L4 information.
// ============================================================

// ============================================================
// L4 - MATERIAL
// ============================================================

export const getBudgetL4Dropdown = (budgetList: BudgetData[], levelId1: number, levelId2: number, levelId3: number ): BudgetDropdownItem[] => {

    if (!budgetList?.length || !levelId1 ||  !levelId2 || !levelId3 ) {
        return [];
    }

    const unique = new Map<number, BudgetDropdownItem>();

    budgetList
        .filter(
            item =>
                item.LevelType === "L4" &&
                item.LevelId1 === levelId1 &&
                item.LevelId2 === levelId2 &&
                item.LevelId3 === levelId3 &&
                item.LevelId4 > 0
        )
        .forEach(item => {

            if (!unique.has(item.LevelId4)) {

                unique.set(item.LevelId4, {
                    label:
                        item.Level4Name ??
                        `Material ${item.LevelId4}`,

                    value: String(item.LevelId4),

                    LevelType: "L4",

                    LevelId1: item.LevelId1,
                    LevelId2: item.LevelId2,
                    LevelId3: item.LevelId3,
                    LevelId4: item.LevelId4,
                    Level4MaterialName: item.Level4MaterialName,
                    Level4SubMaterialUomCode: item.Level4SubMaterialUomCode,
                    Level4SubMaterialUom: item.Level4SubMaterialUom,
                    Level4LeadTimeInDays: item.Level4LeadTimeInDays,
                    Level4IsTolerant: item.Level4IsTolerant,
                    MaterialCost:item.MaterialCost,
                    Quantity:item.Quantity,
                    ReceivedQuantity:item.ReceivedQuantity

                });
            }
        });

    return Array.from(unique.values());
};


// ============================================================
// Find L1 Budget Record
// ============================================================

export const findBudgetL1Item = (budgetList: BudgetData[], levelId1: number ): BudgetData | undefined => {

    if (!budgetList?.length || !levelId1) {
        return undefined;
    }

    return budgetList.find(
        item =>
            item.LevelType === "L1" &&
            item.LevelId1 === levelId1
    );
};


// ============================================================
// Find L2 Budget Record
// ============================================================

export const findBudgetL2Item = (budgetList: BudgetData[], levelId1: number, levelId2: number ): BudgetData | undefined => {

    if (!budgetList?.length || !levelId1 || !levelId2 ) {
        return undefined;
    }

    return budgetList.find(
        item =>
            item.LevelType === "L2" &&
            item.LevelId1 === levelId1 &&
            item.LevelId2 === levelId2
    );
};


// ============================================================
// Find L3 Budget Record
// ============================================================

export const findBudgetL3Item = (budgetList: BudgetData[], levelId1: number, levelId2: number, levelId3: number ): BudgetData | undefined => {

    if (!budgetList?.length || !levelId1 || !levelId2 ||   !levelId3 ) {
        return undefined;
    }

    return budgetList.find(
        item =>
            item.LevelType === "L3" &&
            item.LevelId1 === levelId1 &&
            item.LevelId2 === levelId2 &&
            item.LevelId3 === levelId3
    );
};

// ============================================================
// Find L4 Budget Record
// ============================================================

export const findBudgetL4Item = (budgetList: BudgetData[], levelId1: number, levelId2: number,  levelId3: number, levelId4: number ): BudgetData | undefined => {

    if (!budgetList?.length || !levelId1 || !levelId2 || !levelId3 || !levelId4 ) {
        return undefined;
    }

    return budgetList.find(
        item =>
            item.LevelType === "L4" &&
            item.LevelId1 === levelId1 &&
            item.LevelId2 === levelId2 &&
            item.LevelId3 === levelId3 &&
            item.LevelId4 === levelId4
    );
};