
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { CallLogDatasourceImpl } from '@/features/callTracker/datasources/CallLogDatasource';
import type { AddCallLogRequest, CallLogDeleteResponse, CallLogListResponse, CallLogSaveResponse, CallLogUpdateResponse, DeleteCallLogRequest, FilterWithPaginationCallLogRequest, UpdateCallLogRequest } from '@/features/callTracker/models/CallLogModel';

const CallLogDatasource = new CallLogDatasourceImpl();

export const callLogService = {

    apiCallPullCallLog: async (params: FilterWithPaginationCallLogRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CallLogListResponse>> => {

        try {
            return E.right(await CallLogDatasource.pullCallLog(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddCallLog: async (params: AddCallLogRequest): Promise<E.Either<Failure, CallLogSaveResponse>> => {
        try {

            return E.right(await CallLogDatasource.addCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdateCallLog: async (params: UpdateCallLogRequest): Promise<E.Either<Failure, CallLogUpdateResponse>> => {
        try {

            return E.right(await CallLogDatasource.UpdateCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteCallLog: async (params: DeleteCallLogRequest): Promise<E.Either<Failure, CallLogDeleteResponse>> => {
        try {

            return E.right(await CallLogDatasource.deleteCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}