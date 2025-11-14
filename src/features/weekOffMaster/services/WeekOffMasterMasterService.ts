import type { Failure } from '@/core/api/FailureResponse';
import { WeekOffMasterDatasourceImpl } from '@/features/weekOffMaster/datasources/WeekOffMasterMasterDatasource'
import type {
    FilterWithPaginationWeekOffMasterRequest,
    AddUpdateWeekOffMasterRequest,
    DeleteWeekOffMasterRequest,
    WeekOffMasterListResponse,
    WeekOffMasterSaveResponse,
    WeekOffMasterDeleteResponse
} from '@/features/weekOffMaster/models/WeekOffMasterMasterModel'

import * as E from 'fp-ts/Either';

const weekOffMasterDatasource = new WeekOffMasterDatasourceImpl();

export const WeekOffMasterService = {

    apiCallPullWeekOffMaster: async (params: FilterWithPaginationWeekOffMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, WeekOffMasterListResponse>> => {
        try {

            return E.right(await weekOffMasterDatasource.pullWeekOffMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateWeekOffMaster: async (params: AddUpdateWeekOffMasterRequest): Promise<E.Either<Failure, WeekOffMasterSaveResponse>> => {
        try {

            return E.right(await weekOffMasterDatasource.addUpdateWeekOffMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteWeekOffMaster: async (params: DeleteWeekOffMasterRequest): Promise<E.Either<Failure, WeekOffMasterDeleteResponse>> => {
        try {

            return E.right(await weekOffMasterDatasource.deleteWeekOffMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
