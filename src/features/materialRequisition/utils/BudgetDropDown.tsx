import { budgetService } from "@/features/budget/services/BudgetService";
import * as E from "fp-ts/Either";

export const fetchBudgetDropdown =
    (
        projectId: number,
        levelType: string,
    ) =>
    async (pageNumber: number, params?: { value?: string }) => {
        try {
            const responseEither =
                await budgetService.apiCallPullBudget({
                    PageSize: 100,
                    PageNumber: pageNumber,
                    ProjectId: projectId,
                    LevelType: levelType,
                    CategoryName: params?.value?.trim() || "",
                });

            if (E.isLeft(responseEither)) {
                return {
                    totalNumberOfRecord: 0,
                    itemList: [],
                };
            }

            const data = responseEither.right.Data ?? [];

            return {
                totalNumberOfRecord:
                    responseEither.right.TotalNumberOfRecord ?? data.length,

                itemList: data.map(item => ({
                    label: item.CategoryName ?? "",
                    value: String(item.BudgetId),
                    uom: item.Uom ?? "",
                })),
            };
        } catch (error) {
            console.error("FETCH BUDGET DROPDOWN ERROR", error);

            return {
                totalNumberOfRecord: 0,
                itemList: [],
            };
        }
    };