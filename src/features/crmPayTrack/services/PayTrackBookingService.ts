import type { Failure } from '@/core/api/FailureResponse';
import { PayTrackBookingDatasourceImpl } from '@/features/crmPayTrack/datasources/PayTrackBookingDatasource';
import type { FilterWithPaginationPayTrackBooking, PayTrackBookingListResponse } from '@/features/crmPayTrack/models/PayTrackBookingModel';
import * as E from 'fp-ts/Either';

const payTrackBookingDatasource = new PayTrackBookingDatasourceImpl();

export const payTrackBookingService = {

    apiCallPullPayTrackBooking: async (params: FilterWithPaginationPayTrackBooking, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PayTrackBookingListResponse>> => {

        try {

            return E.right(await payTrackBookingDatasource.pullPayTrackBooking(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}

