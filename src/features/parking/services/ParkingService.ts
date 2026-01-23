import type { Failure } from '@/core/api/FailureResponse';
import { ParkingDatasourceImpl } from '@/features/parking/datasources/ParkingDatasource'
import type {
    FilterWithPaginationParkingRequest,
    ParkingListResponse,
    FilterParkingRequest,
    ParkingUpdateResponse,
    UpdateParkingRequest
} from '@/features/parking/models/ParkingModel'

import * as E from 'fp-ts/Either';

const parkingDatasource = new ParkingDatasourceImpl();

export const parkingService = {

    apiCallPullParking: async (params: FilterParkingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ParkingListResponse>> => {
        try {

            return E.right(await parkingDatasource.pullParking(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdateParking: async (params: UpdateParkingRequest): Promise<E.Either<Failure, ParkingUpdateResponse>> => {
        try {

            return E.right(await parkingDatasource.updateParking(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullParkingWithPagination: async (params: FilterWithPaginationParkingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ParkingListResponse>> => {
        try {

            return E.right(await parkingDatasource.pullParkingWithPagination(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
