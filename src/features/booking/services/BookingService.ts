import type { Failure } from '@/core/api/FailureResponse';
import { BookingDatasourceImpl } from '@/features/booking/datasources/BookingDatasource'
import type {
    FilterWithPaginationBookingRequest,
    BookingListResponse,
    BookingSaveResponse,
    CancelBookingRequest,
    BookingDeleteResponse,
    FilterWithPaginationChannelPartnerBookingRequest,
    FilterPaymentScheduleStagesRequest,
    PaymentScheduleStagesResponse,
    BookingUpdateegistrationDateParkingResponse
} from '@/features/booking/models/BookingModel'

import * as E from 'fp-ts/Either';

const bookingDatasource = new BookingDatasourceImpl();

export const bookingService = {
    apiCallPullBooking: async (params: FilterWithPaginationBookingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BookingListResponse>> => {
        try {
            return E.right(await bookingDatasource.pullBooking(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateBooking: async (data: FormData): Promise<E.Either<Failure, BookingSaveResponse>> => {
        try {
            return E.right(await bookingDatasource.addUpdateBooking(data));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallCancelBooking: async (params: CancelBookingRequest): Promise<E.Either<Failure, BookingDeleteResponse>> => {
        try {
            return E.right(await bookingDatasource.cancelBooking(params));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullChannelPartnerBooking: async (params: FilterWithPaginationChannelPartnerBookingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BookingListResponse>> => {
        try {
            return E.right(await bookingDatasource.pullChannelPartnerBooking(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullPaymentScheduleStages: async (params: FilterPaymentScheduleStagesRequest): Promise<E.Either<Failure, PaymentScheduleStagesResponse>> => {
        try {
            return E.right(await bookingDatasource.pullPaymentScheduleStages(params));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },
    apiCallUpdatePayTrackBookingRegistrationDateParking: async (formData: FormData): Promise<E.Either<Failure, BookingUpdateegistrationDateParkingResponse>> => {
        try {
            return E.right(await bookingDatasource.updatePayTrackBookingRegistrationDateParking(formData));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },
}

