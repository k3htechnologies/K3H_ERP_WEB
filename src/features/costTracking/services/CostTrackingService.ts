
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { CostTrackingDataSourceImpl } from '../datasources/CostTrackingDataSource';
import type { AddUpdateCostTrackingData, CostTrackingListResponse, CostTrackingSaveResponse, FilterWithPaginationCostTracking } from '../models/CostTrackingModel';

const CostTrackingDatasource = new CostTrackingDataSourceImpl();

export const CostTrackingService = {

    apiCallPullCostTracking: async (params: FilterWithPaginationCostTracking, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CostTrackingListResponse>> => {

        try {
            return E.right(await CostTrackingDatasource.pullCostTracking(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateCostTracking: async (data: AddUpdateCostTrackingData): Promise<E.Either<Failure, CostTrackingSaveResponse>> => {
        try {
            return E.right(await CostTrackingDatasource.addUpdateCostTracking(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}