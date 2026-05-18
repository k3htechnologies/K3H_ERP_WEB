import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import type { AddUpdateStockManagementRequest, FilterWithPaginationStockManagementHistoryRequest, FilterWithPaginationStockManagementRequest, StockManagementHistoryListResponse, StockManagementListResponse, StockManagementSaveResponse } from 'features/stockManagement/models/StockManagementModel';
import { StockManagementDatasourceImpl } from '@/features/stockManagement/datasources/StockManagementDatasource';

const StockManagementDatasource = new StockManagementDatasourceImpl();

export const stockManagementService = {

    apiCallPullStockManagement: async (params: FilterWithPaginationStockManagementRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, StockManagementListResponse>> => {
        try {

            return E.right(await StockManagementDatasource.pullStockManagement(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullStockManagementHistory: async (params: FilterWithPaginationStockManagementHistoryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, StockManagementHistoryListResponse>> => {
        try {

            return E.right(await StockManagementDatasource.pullStockManagementHistory(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateStockManagement: async (params: AddUpdateStockManagementRequest): Promise<E.Either<Failure, StockManagementSaveResponse>> => {
        try {

            return E.right(await StockManagementDatasource.addUpdateStockManagement(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
