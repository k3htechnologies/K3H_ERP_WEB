import type { Failure } from '@/core/api/FailureResponse';
import { BookingApplicantModificationDatasourceImpl } from '@/features/crmPayTrack/datasources/BookingApplicantModificationDatasource'
import type {
    FilterWithPaginationBookingApplicantModificationRequest,
    BookingApplicantModificationListResponse,
    BookingApplicantModificationSaveReponse,
    DeleteBookingApplicantModificationModelRequest,
    BookingApplicantModificationDeleteReponse
} from '@/features/crmPayTrack/models/BookingApplicantModificationModel';

import * as E from 'fp-ts/Either';

const bookingApplicantModificationCrmDatasource = new BookingApplicantModificationDatasourceImpl();

export const bookingApplicantModificationService = {

    apiCallPullBookingApplicantModification: async (params: FilterWithPaginationBookingApplicantModificationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BookingApplicantModificationListResponse>> => {
        try {

            return E.right(await bookingApplicantModificationCrmDatasource.pullBookingApplicantModification(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBookingApplicantModification: async (data: FormData): Promise<E.Either<Failure, BookingApplicantModificationSaveReponse>> => {

        try {

            return E.right(await bookingApplicantModificationCrmDatasource.addUpdateBookingApplicantModification(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteBookingApplicantModificationRequest: async (params: DeleteBookingApplicantModificationModelRequest): Promise<E.Either<Failure, BookingApplicantModificationDeleteReponse>> => {
        try {

            return E.right(await bookingApplicantModificationCrmDatasource.deleteBookingApplicantModificationRequest(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}