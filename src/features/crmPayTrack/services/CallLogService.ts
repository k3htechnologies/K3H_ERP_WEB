
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { CallLogDatasourceImpl } from '@/features/crmPayTrack/datasources/CallLogDatasource';
import type { AddCallLogRequest, CallLogDeleteResponse, CallLogListResponse, CallLogSaveResponse, CallLogUpdateResponse, DeleteCallLogRequest, FilterWithPaginationCallLogRequest, UpdateCallLogRequest } from '@/features/crmPayTrack/models/CallLogModel';

const CallLogDatasource = new CallLogDatasourceImpl();

export const callLogService = {

    apiCallPullPayTrackCallLog: async (params: FilterWithPaginationCallLogRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CallLogListResponse>> => {

        try {
            return E.right(await CallLogDatasource.pullPayTrackCallLog(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddPayTrackCallLog: async (params: AddCallLogRequest): Promise<E.Either<Failure, CallLogSaveResponse>> => {
        try {

            return E.right(await CallLogDatasource.addPayTrackCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdatePayTrackCallLog: async (params: UpdateCallLogRequest): Promise<E.Either<Failure, CallLogUpdateResponse>> => {
        try {

            return E.right(await CallLogDatasource.updatePayTrackCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeletePayTrackCallLog: async (params: DeleteCallLogRequest): Promise<E.Either<Failure, CallLogDeleteResponse>> => {
        try {

            return E.right(await CallLogDatasource.deletePayTrackCallLog(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}