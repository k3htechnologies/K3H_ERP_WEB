import type { Failure } from '@/core/api/FailureResponse';
import { BookingLoanDetailsDatasourceImpl } from '@/features/crmPayTrackScreen/datasources/BookingLoanDetailsDatasource'
import type {
    DeleteBookingLoanDetailsRequest,
    FilterWithPaginationBookingLoanDetails,
    BookingLoanDetailsDeleteResponse,
    BookingLoanDetailsListResponse,
    AddUpdateBookingLoanDetailsRequest,
    BookingLoanDetailsSaveReponse
} from '@/features/crmPayTrackScreen/models/BookingLoanDetailsModel';

import * as E from 'fp-ts/Either';

const bookingLoanDetailsDatasource = new BookingLoanDetailsDatasourceImpl();

export const bookingLoanDetailsService = {

    apiCallPullBookingLoanDetails: async (params: FilterWithPaginationBookingLoanDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BookingLoanDetailsListResponse>> => {
        try {

            return E.right(await bookingLoanDetailsDatasource.pullBookingLoanDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBookingLoanDetails: async (params: AddUpdateBookingLoanDetailsRequest): Promise<E.Either<Failure, BookingLoanDetailsSaveReponse>> => {
        try {

            return E.right(await bookingLoanDetailsDatasource.addUpdateBookingLoanDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBookingLoanDetails: async (params: DeleteBookingLoanDetailsRequest): Promise<E.Either<Failure, BookingLoanDetailsDeleteResponse>> => {
        try {

            return E.right(await bookingLoanDetailsDatasource.deleteBookingLoanDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}


