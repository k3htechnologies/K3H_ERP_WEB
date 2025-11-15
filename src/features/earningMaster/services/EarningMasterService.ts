import type { Failure } from '@/core/api/FailureResponse';
import { EarningMasterDatasourceImpl } from '@/features/earningMaster/datasources/EarningMasterDatasource'
import type {
    FilterWithPaginationEarningMasterRequest,
    AddUpdateEarningMasterRequest,
    DeleteEarningMasterRequest,
    EarningMasterListResponse,
    EarningMasterSaveResponse,
    EarningMasterDeleteResponse
} from '@/features/earningMaster/models/EarningMasterModel'

import * as E from 'fp-ts/Either';

const earningMasterDatasource = new EarningMasterDatasourceImpl();

export const EarningMasterService = {

    apiCallPullEarningMaster: async (params: FilterWithPaginationEarningMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, EarningMasterListResponse>> => {
        try {

            return E.right(await earningMasterDatasource.pullEarningMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEarningMaster: async (params: AddUpdateEarningMasterRequest): Promise<E.Either<Failure, EarningMasterSaveResponse>> => {
        try {

            return E.right(await earningMasterDatasource.addUpdateEarningMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEarningMaster: async (params: DeleteEarningMasterRequest): Promise<E.Either<Failure, EarningMasterDeleteResponse>> => {
        try {

            return E.right(await earningMasterDatasource.deleteEarningMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
