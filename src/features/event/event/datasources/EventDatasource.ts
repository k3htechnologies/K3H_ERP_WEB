import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EventApi } from '@/features/event/event/api/EventApi'
import type {
    FilterWithPaginationEventRequest,
    DeleteEventRequest,
    EventListResponse,
    EventSaveResponse,
    EventDeleteResponse
} from '@/features/event/event/models/EventModel'

export abstract class EventDatasource {

    abstract pullEvent(params: FilterWithPaginationEventRequest, signal?: AbortSignal): Promise<EventListResponse>
    abstract addUpdateEvent(params: FormData): Promise<EventSaveResponse>
    abstract deleteEvent(params: DeleteEventRequest): Promise<EventDeleteResponse>
}

export class EventDatasourceImpl implements EventDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullEvent(params: FilterWithPaginationEventRequest, signal?: AbortSignal): Promise<EventListResponse> {
        try {
            const queryParams = new URLSearchParams({
                EventId: params.EventId.toString(),
            })

            if (params.Title?.trim()) queryParams.append('Title', params.Title.trim())
            if (params.FromDate?.trim()) queryParams.append('FromDate', params.FromDate.trim())
            if (params.ToDate?.trim()) queryParams.append('ToDate', params.ToDate.trim())
            if (params.Type?.trim()) queryParams.append('Type', params.Type.trim())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            const response= await this.k3hHttpClient.getRequestWithAuthentication(
                `${EventApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response

        } catch (error: any) {
            console.error('ERROR: PULL EVENT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullEvent(params, signal)
            }

            throw error
        }
    }

    async addUpdateEvent(params: FormData): Promise<EventSaveResponse> {
        try {
            const response= await this.k3hHttpClient.multipartRequestWithAuthentication(
                EventApi.ADD_UPDATE,
                params
            )
            
            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE EVENT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateEvent(params)
            }

            throw error
        }
    }

    async deleteEvent(params: DeleteEventRequest): Promise<EventDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EventId: (params.EventId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response= await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EventApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            console.error('ERROR: DELETE EVENT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteEvent(params)
            }

            throw error
        }
    }
}
