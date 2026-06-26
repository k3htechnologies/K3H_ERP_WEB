
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { BudgetDatasourceImpl } from '@/features/budget/datasources/BudgetDataSource';
import type { AddUpdateBudget, BudgetSaveResponse, BudgetListResponse, FilterWithPaginationBudgetRequest } from '@/features/budget/models/BudgetModel';

const BudgetDatasource = new BudgetDatasourceImpl();

export const budgetService = {

    apiCallPullBudget: async (params: FilterWithPaginationBudgetRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BudgetListResponse>> => {

        try {
            return E.right(await BudgetDatasource.pullBudget(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateBudget: async (data: AddUpdateBudget): Promise<E.Either<Failure, BudgetSaveResponse>> => {
        try {
            return E.right(await BudgetDatasource.addUpdateBudget(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}