import type { Failure } from '@/core/api/FailureResponse';
import { ShiftMasterDatasourceImpl } from '@/features/shiftMaster/datasources/ShiftMasterDatasource'
import type {
    FilterWithPaginationShiftMasterRequest,
    AddUpdateShiftMasterRequest,
    DeleteShiftMasterRequest,
    ShiftMasterListResponse,
    ShiftMasterSaveResponse,
    ShiftMasterDeleteResponse
} from '@/features/shiftMaster/models/ShiftMasterModel'

import * as E from 'fp-ts/Either';

const shiftMasterDatasource = new ShiftMasterDatasourceImpl();

export const shiftMasterService = {

    apiCallPullShiftMaster: async (params: FilterWithPaginationShiftMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ShiftMasterListResponse>> => {
        try {

            return E.right(await shiftMasterDatasource.pullShiftMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateShiftMaster: async (params: AddUpdateShiftMasterRequest): Promise<E.Either<Failure, ShiftMasterSaveResponse>> => {
        try {

            return E.right(await shiftMasterDatasource.addUpdateShiftMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteShiftMaster: async (params: DeleteShiftMasterRequest): Promise<E.Either<Failure, ShiftMasterDeleteResponse>> => {
        try {

            return E.right(await shiftMasterDatasource.deleteShiftMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
