
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import type { CallTrackerListResponse, FilterWithPaginationCallTrackerRequest } from "@/features/callTracker/models/CallTrackerModel";
import { CallTrackerDatasourceImpl } from '@/features/callTracker/datasources/CallTrackerDatasource';

const CallTrackerDatasource = new CallTrackerDatasourceImpl();

export const callTrackerService = {

    apiCallPullCallTracker: async (params: FilterWithPaginationCallTrackerRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CallTrackerListResponse>> => {

        try {
            return E.right(await CallTrackerDatasource.pullCallTracker(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}