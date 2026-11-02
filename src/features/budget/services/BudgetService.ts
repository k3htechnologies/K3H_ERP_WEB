
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { BudgetDatasourceImpl } from '@/features/budget/datasources/BudgetDataSource';
import type { AddUpdateBudget, BudgetSaveResponse, BudgetListResponse, FilterWithPaginationBudgetRequest, SubmitBudgetForApprovalResponse, SubmitBudgetForApprovalData,FilterWithInventoryProjectBasementPodiumWingBudgetRequest,InventoryProjectBasementPodiumWingBudgetResponse } from '@/features/budget/models/BudgetModel';

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
    },

    apiCallSubmitBudgetForApproval: async (data: SubmitBudgetForApprovalData): Promise<E.Either<Failure, SubmitBudgetForApprovalResponse>> => {
        try {

            return E.right(await BudgetDatasource.submitBudgetForApproval(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
    apiCallPullInventoryProjectBasementPodiumWingBudget: async (data: FilterWithInventoryProjectBasementPodiumWingBudgetRequest): Promise<E.Either<Failure, InventoryProjectBasementPodiumWingBudgetResponse>> => {
        try {
            
            return E.right(await BudgetDatasource.pullInventoryProjectBasementPodiumWingBudget(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}