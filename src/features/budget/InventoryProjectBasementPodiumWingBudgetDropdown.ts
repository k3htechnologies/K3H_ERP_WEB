import * as E from 'fp-ts/Either';
import { budgetService } from "@/features/budget/services/BudgetService";

export const fetchInventoryProjectBasementPodiumWingBudgetDropdown = async (params?: { projectId?: number; searchText?: string,isDisplayProjectBudget?:boolean }) => {

  try {

    const responseEither = await budgetService.apiCallPullInventoryProjectBasementPodiumWingBudget({
      ProjectId: Number(params?.projectId),
      SearchText: params?.searchText || '',
      IsDisplayProjectBudget:params?.isDisplayProjectBudget || false
    });

    if (E.isLeft(responseEither)) {

      return {
        totalNumberOfRecord: 0,
        itemList: [] as {
          label: string;
          value: string;
          BudgetAmount: number;
        }[],
      };

    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      
      label: d.ProjectBuildingNumberWing ?? "",
      value: String(d.InventoryFlatFloorBasementPodiumWingId),
      BudgetAmount: d.BudgetAmount ?? 0,

    }));

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList,
    };
  } catch (err) {

    console.error("FETCH INVENTORY PROJECT BASEMENT PODIUM WING BUDGET DROPDOWN ERROR",err);

    return {
      totalNumberOfRecord: 0,
      itemList: [] as {
        label: string;
        value: string;
        BudgetAmount: number;
      }[],
    };
  }
};