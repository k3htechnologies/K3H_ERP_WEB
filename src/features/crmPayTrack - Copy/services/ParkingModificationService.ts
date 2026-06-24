import type { Failure } from '@/core/api/FailureResponse';
import { PayTrackParkingModificationDatasourceImpl } from '@/features/crmPayTrack/datasources/PayTrackParkingModificationDatasource'
import type {
    FilterWithPaginationParkingModificationDetails,
    ParkingModificationDetailsListResponse,
    ParkingModificationDetailsSaveReponse
} from '@/features/crmPayTrack/models/ParkingModificationModel';

import * as E from 'fp-ts/Either';

const payTrackParkingModificationDatasource = new PayTrackParkingModificationDatasourceImpl();

export const parkingModificationService = {

    apiCallPullParkingModificationDetails: async (params: FilterWithPaginationParkingModificationDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ParkingModificationDetailsListResponse>> => {
        try {

            return E.right(await payTrackParkingModificationDatasource.pullParkingModificationDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateParkingModificationDetails: async (formData: FormData): Promise<E.Either<Failure, ParkingModificationDetailsSaveReponse>> => {
        try {

            return E.right(await payTrackParkingModificationDatasource.addUpdateParkingModificationDetails(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}