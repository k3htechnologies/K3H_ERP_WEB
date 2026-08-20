import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ConferenceApi } from '@/features/event/conference/api/ConferenceApi'
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

export abstract class ConferenceDatasource {

    abstract addUpdateConferenceDetails(params: AddUpdateConferenceDetailsRequest): Promise<ConferenceDetailsSaveResponse>
    abstract deleteConferenceBooking(params: DeleteConferenceBookingRequest): Promise<ConferenceBookingDeleteResponse>
    abstract pullConferenceDetails(params: PullConferenceDetailsRequest, signal?: AbortSignal): Promise<ConferenceRoomListResponse>
    abstract pullConferenceBookingDetails(params: PullConferenceBookingDetailsRequest, signal?: AbortSignal): Promise<ConferenceDetailsListResponse>
}

export class ConferenceDatasourceImpl implements ConferenceDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async addUpdateConferenceDetails(params: AddUpdateConferenceDetailsRequest): Promise<ConferenceDetailsSaveResponse> {
        try {
             const response= await this.k3hHttpClient.postRequestWithAuthentication(
                ConferenceApi.ADD_UPDATE,
                params
            )

             return response

        } catch (error) {
            console.error('ERROR: ADD UPDATE CONFERENCE DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateConferenceDetails(params)
            }

            throw error
        }
    }

    async deleteConferenceBooking(params: DeleteConferenceBookingRequest): Promise<ConferenceBookingDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ConferenceRoomBookingId: params.ConferenceRoomBookingId.toString(),
                UniqueKey: params.UniqueKey,
            })

            const response= await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ConferenceApi.DELETE}?${queryParams.toString()}`
            )

             return response

        } catch (error) {
            console.error('ERROR: DELETE CONFERENCE BOOKING :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteConferenceBooking(params)
            }

            throw error
        }
    }

    async pullConferenceDetails(params: PullConferenceDetailsRequest, signal?: AbortSignal): Promise<ConferenceRoomListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: params.PageSize.toString(),
                PageNumber: params.PageNumber.toString(),
                RoomId: params.RoomId.toString(),
            })

             const response= await this.k3hHttpClient.getRequestWithAuthentication(
                `${ConferenceApi.PULL_DETAILS}?${queryParams.toString()}`,
                { signal }
            )

             return response

        } catch (error) {
            console.error('ERROR: PULL CONFERENCE DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullConferenceDetails(params, signal)
            }

            throw error
        }
    }

    async pullConferenceBookingDetails(params: PullConferenceBookingDetailsRequest, signal?: AbortSignal): Promise<ConferenceDetailsListResponse> {
        try {
        const queryParams = new URLSearchParams({
             PageSize: params.PageSize ? params.PageSize.toString() : '',
            PageNumber: params.PageNumber ? params.PageNumber.toString() : '',
            SortBy: params.SortBy ? params.SortBy : '',
             MeetingId: params.MeetingId ? params.MeetingId.toString() : ''
            });

         
            if (params.MeetingId) {
                queryParams.append('MeetingId', params.MeetingId.toString())
            }
            if (params.SortBy?.trim()) {
                queryParams.append('SortBy', params.SortBy.trim())
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ConferenceApi.PULL_BOOKING_DETAILS}?${queryParams.toString()}`,
                { signal }
            )

            return response

        } catch (error) {
            console.error('ERROR: PULL CONFERENCE BOOKING DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullConferenceBookingDetails(params, signal)
            }

            throw error
        }
    }
}
