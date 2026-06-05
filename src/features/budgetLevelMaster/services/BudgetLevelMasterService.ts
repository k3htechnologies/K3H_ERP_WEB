
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { BudgetLevelMasterDatasourceImpl } from '@/features/budgetLevelMaster/datasources/BudgetLevelMasterDataSource';
import type { AddUpdateBudgetLevelMaster, BudgetLevelMasterListResponse, BudgetLevelMasterSaveResponse, DeleteBudgetLevelMasterRequest, DeleteBudgetLevelMasterResponse, FilterWithPaginationBudgetLevelMasterRequest } from '@/features/budgetLevelMaster/models/BudgetLevelMasterModel';

const BudgetLevelMasterDatasource = new BudgetLevelMasterDatasourceImpl();

export const budgetLevelMasterService = {

    apiCallPullBudgetLevelMaster: async (params: FilterWithPaginationBudgetLevelMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BudgetLevelMasterListResponse>> => {

        try {

            return E.right(await BudgetLevelMasterDatasource.pullBudgetLevelMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateBudgetLevelMaster: async (data: AddUpdateBudgetLevelMaster): Promise<E.Either<Failure, BudgetLevelMasterSaveResponse>> => {

        try {

            return E.right(await BudgetLevelMasterDatasource.addUpdateBudgetLevelMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteBudgetLevelMaster: async (params: DeleteBudgetLevelMasterRequest): Promise<E.Either<Failure, DeleteBudgetLevelMasterResponse>> => {

        try {
            return E.right(await BudgetLevelMasterDatasource.deleteBudgetLevelMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}