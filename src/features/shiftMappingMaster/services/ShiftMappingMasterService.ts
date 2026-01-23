import type { Failure } from '@/core/api/FailureResponse';
import { ShiftMappingMasterDatasourceImpl } from '@/features/shiftMappingMaster/datasources/ShiftMappingMasterDatasource'
import type {
    FilterWithPaginationShiftMappingMasterRequest,
    AddUpdateShiftMappingMasterRequest,
    DeleteShiftMappingMasterRequest,
    ShiftMappingMasterListResponse,
    ShiftMappingMasterSaveResponse,
    ShiftMappingMasterDeleteResponse
} from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel'

import * as E from 'fp-ts/Either';

const shiftMappingMasterDatasource = new ShiftMappingMasterDatasourceImpl();

export const shiftMappingMasterService = {

    apiCallPullShiftMappingMaster: async (params: FilterWithPaginationShiftMappingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ShiftMappingMasterListResponse>> => {
        try {

            return E.right(await shiftMappingMasterDatasource.pullShiftMappingMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateShiftMappingMaster: async (params: AddUpdateShiftMappingMasterRequest): Promise<E.Either<Failure, ShiftMappingMasterSaveResponse>> => {
        try {

            return E.right(await shiftMappingMasterDatasource.addUpdateShiftMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteShiftMappingMaster: async (params: DeleteShiftMappingMasterRequest): Promise<E.Either<Failure, ShiftMappingMasterDeleteResponse>> => {
        try {

            return E.right(await shiftMappingMasterDatasource.deleteShiftMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
