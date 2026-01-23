import type { Failure } from '@/core/api/FailureResponse';
import { WeekOffMappingMasterDatasourceImpl } from '@/features/weekOffMappingMaster/datasources/WeekOffMappingMasterDatasource'
import type {
    FilterWithPaginationWeekOffMappingMasterRequest,
    AddUpdateWeekOffMappingMasterRequest,
    DeleteWeekOffMappingMasterRequest,
    WeekOffMappingMasterListResponse,
    WeekOffMappingMasterSaveResponse,
    WeekOffMappingMasterDeleteResponse
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel'

import * as E from 'fp-ts/Either';

const weekOffMappingMasterDatasource = new WeekOffMappingMasterDatasourceImpl();

export const weekOffMappingMasterService = {

    apiCallPullWeekOffMappingMaster: async (params: FilterWithPaginationWeekOffMappingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, WeekOffMappingMasterListResponse>> => {
        try {

            return E.right(await weekOffMappingMasterDatasource.pullWeekOffMappingMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateWeekOffMappingMaster: async (params: AddUpdateWeekOffMappingMasterRequest): Promise<E.Either<Failure, WeekOffMappingMasterSaveResponse>> => {
        try {

            return E.right(await weekOffMappingMasterDatasource.addUpdateWeekOffMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteWeekOffMappingMaster: async (params: DeleteWeekOffMappingMasterRequest): Promise<E.Either<Failure, WeekOffMappingMasterDeleteResponse>> => {
        try {

            return E.right(await weekOffMappingMasterDatasource.deleteWeekOffMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
