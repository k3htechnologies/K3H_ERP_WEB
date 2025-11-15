import type { Failure } from '@/core/api/FailureResponse';
import { HolidayMappingMasterDatasourceImpl } from '@/features/holidayMappingMaster/datasources/HolidayMappingMasterDatasource'
import type {
    FilterWithPaginationHolidayMappingMasterRequest,
    AddUpdateHolidayMappingMasterRequest,
    DeleteHolidayMappingMasterRequest,
    HolidayMappingMasterListResponse,
    HolidayMappingMasterSaveResponse,
    HolidayMappingMasterDeleteResponse
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel'

import * as E from 'fp-ts/Either';

const holidayMappingMasterDatasource = new HolidayMappingMasterDatasourceImpl();

export const HolidayMappingMasterService = {

    apiCallPullHolidayMappingMaster: async (params: FilterWithPaginationHolidayMappingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, HolidayMappingMasterListResponse>> => {
        try {

            return E.right(await holidayMappingMasterDatasource.pullHolidayMappingMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateHolidayMappingMaster: async (params: AddUpdateHolidayMappingMasterRequest): Promise<E.Either<Failure, HolidayMappingMasterSaveResponse>> => {
        try {

            return E.right(await holidayMappingMasterDatasource.addUpdateHolidayMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteHolidayMappingMaster: async (params: DeleteHolidayMappingMasterRequest): Promise<E.Either<Failure, HolidayMappingMasterDeleteResponse>> => {
        try {

            return E.right(await holidayMappingMasterDatasource.deleteHolidayMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
