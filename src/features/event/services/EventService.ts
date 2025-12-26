import type { Failure } from '@/core/api/FailureResponse';
import { EventDatasourceImpl } from '@/features/event/datasources/EventDatasource'
import type {
    FilterWithPaginationEventRequest,
    DeleteEventRequest,
    EventListResponse,
    EventSaveResponse,
    EventDeleteResponse
} from '@/features/event/models/EventModel';

import * as E from 'fp-ts/Either';

const eventDatasource = new EventDatasourceImpl();

export const eventService = {

    apiCallPullEvent: async (params: FilterWithPaginationEventRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, EventListResponse>> => {
        try {

            return E.right(await eventDatasource.pullEvent(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEvent: async (params: FormData): Promise<E.Either<Failure, EventSaveResponse>> => {
        try {

            return E.right(await eventDatasource.addUpdateEvent(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEvent: async (params: DeleteEventRequest): Promise<E.Either<Failure, EventDeleteResponse>> => {
        try {

            return E.right(await eventDatasource.deleteEvent(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
