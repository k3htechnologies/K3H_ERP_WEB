
import * as E from 'fp-ts/Either';
import { CallMonitoringDatasourceImpl } from '@/features/callMonitoring/dataSources/CallMonitoringDataSource';
import type { AddCallMonitoring, CallMonitoringDeleteResponse, CallMonitoringListResponse, CallMonitoringSaveResponse, CallMonitoringUpdateResponse, DeleteCallMonitoring, FilterWithPaginationCallMonitoring, UpdateCallMonitoring } from '@/features/callMonitoring/models/CallMonitoringModel';
import type { Failure } from '@/core/api/FailureResponse';

const CallMonitoringDatasource = new CallMonitoringDatasourceImpl();

export const callMonitoringService = {

    apiCallPullCallMonitoring: async (params: FilterWithPaginationCallMonitoring, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CallMonitoringListResponse>> => {

        try {

            return E.right(await CallMonitoringDatasource.pullCallMonitoring(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddCallMonitoring: async (params: AddCallMonitoring): Promise<E.Either<Failure, CallMonitoringSaveResponse>> => {

        try {

            return E.right(await CallMonitoringDatasource.addCallMonitoring(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallUpdateCallMonitoring: async (params: UpdateCallMonitoring): Promise<E.Either<Failure, CallMonitoringUpdateResponse>> => {

        try {

            return E.right(await CallMonitoringDatasource.updateCallMonitoring(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteCallMonitoring: async (params: DeleteCallMonitoring): Promise<E.Either<Failure, CallMonitoringDeleteResponse>> => {

        try {

            return E.right(await CallMonitoringDatasource.deleteCallMonitoring(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}