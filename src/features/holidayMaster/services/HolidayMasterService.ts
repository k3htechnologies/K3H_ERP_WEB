import type { Failure } from '@/core/api/FailureResponse';
import { HolidayMasterDatasourceImpl } from '@/features/holidayMaster/datasources/HolidayMasterDatasource'
import type {
    FilterWithPaginationHolidayMasterRequest,
    DeleteHolidayMasterRequest,
    HolidayMasterListResponse,
    HolidayMasterSaveResponse,
    HolidayMasterDeleteResponse
} from '@/features/holidayMaster/models/HolidayMasterModel'

import * as E from 'fp-ts/Either';

const holidayMasterDatasource = new HolidayMasterDatasourceImpl();

export const HolidayMasterService = {

    apiCallPullHolidayMaster: async (params: FilterWithPaginationHolidayMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, HolidayMasterListResponse>> => {
        try {

            return E.right(await holidayMasterDatasource.pullHolidayMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateHolidayMaster: async (FormData: FormData): Promise<E.Either<Failure, HolidayMasterSaveResponse>> => {
        try {

            return E.right(await holidayMasterDatasource.addUpdateHolidayMaster(FormData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteHolidayMaster: async (params: DeleteHolidayMasterRequest): Promise<E.Either<Failure, HolidayMasterDeleteResponse>> => {
        try {

            return E.right(await holidayMasterDatasource.deleteHolidayMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
