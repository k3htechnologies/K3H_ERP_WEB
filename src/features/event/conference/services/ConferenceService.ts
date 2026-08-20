import type { Failure } from '@/core/api/FailureResponse'
import { ConferenceDatasourceImpl } from '@/features/event/conference/datasources/ConferenceDatasource'
import type {
    AddUpdateConferenceDetailsRequest,
    ConferenceBookingDeleteResponse,
    ConferenceDetailsListResponse,
    ConferenceDetailsSaveResponse,
    ConferenceRoomListResponse,
    DeleteConferenceBookingRequest,
    PullConferenceBookingDetailsRequest,
    PullConferenceDetailsRequest
} from '@/features/event/conference/models/ConferenceModel'
import * as E from 'fp-ts/Either'

const conferenceDatasource = new ConferenceDatasourceImpl()

export const ConferenceService = {

    apiCallAddUpdateConferenceDetails: async (params: AddUpdateConferenceDetailsRequest): Promise<E.Either<Failure, ConferenceDetailsSaveResponse>> => {
        try {

            return E.right(await conferenceDatasource.addUpdateConferenceDetails(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteConferenceBooking: async (params: DeleteConferenceBookingRequest): Promise<E.Either<Failure, ConferenceBookingDeleteResponse>> => {
        try {

            return E.right(await conferenceDatasource.deleteConferenceBooking(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullConferenceDetails: async (params: PullConferenceDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ConferenceRoomListResponse>> => {
        try {

            return E.right(await conferenceDatasource.pullConferenceDetails(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullConferenceBookingDetails: async (params: PullConferenceBookingDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ConferenceDetailsListResponse>> => {
        try {

            return E.right(await conferenceDatasource.pullConferenceBookingDetails(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },
}
