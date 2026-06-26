
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { CallingDataDatasourceImpl } from '@/features/callTracker/datasources/CallingDataDatasource';
import type { AddUpdateCallingDataRequest, CallingDataListResponse, FilterWithPaginationCallingDataRequest } from '@/features/callTracker/models/CallingDataModel';

const CallingDataDatasource = new CallingDataDatasourceImpl();

export const callingDataService = {

    apiCallPullCallingData: async (params: FilterWithPaginationCallingDataRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CallingDataListResponse>> => {

        try {
            return E.right(await CallingDataDatasource.pullCallingData(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateCallingData: async (params: AddUpdateCallingDataRequest): Promise<E.Either<Failure, CallingDataListResponse>> => {
        try {

            return E.right(await CallingDataDatasource.addUpdateCallingData(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}