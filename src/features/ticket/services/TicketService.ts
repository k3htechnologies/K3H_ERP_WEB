import type { Failure } from '@/core/api/FailureResponse';
import { TicketDatasourceImpl } from '@/features/ticket/datasources/TicketDatasource'
import type {
    DeleteTicketModelRequest,
    FilterWithPaginationPullActiveTicket,
    FilterWithPaginationTicket,
    TicketDeleteResponse,
    TicketListResponse,
    TicketPullActiveTicketListResponse,
} from '@/features/ticket/models/TicketModel';

import * as E from 'fp-ts/Either';

const ticketDatasource = new TicketDatasourceImpl();

export const ticketService = {

    apiCallPullTicket: async (params: FilterWithPaginationTicket, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TicketListResponse>> => {
        try {

            return E.right(await ticketDatasource.pullTicket(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullAssignedActiveTickets: async (params: FilterWithPaginationPullActiveTicket, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TicketPullActiveTicketListResponse>> => {
        try {

            return E.right(await ticketDatasource.pullAssignedActiveTickets(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTicket: async (formData: FormData): Promise<E.Either<Failure, TicketListResponse>> => {
        try {

            return E.right(await ticketDatasource.addUpdateTicket(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateAssignedTickets: async (formData: FormData): Promise<E.Either<Failure, TicketListResponse>> => {
        try {

            return E.right(await ticketDatasource.addUpdateAssignedTickets(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTicket: async (params: DeleteTicketModelRequest): Promise<E.Either<Failure, TicketDeleteResponse>> => {
        try {

            return E.right(await ticketDatasource.deleteTicket(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
