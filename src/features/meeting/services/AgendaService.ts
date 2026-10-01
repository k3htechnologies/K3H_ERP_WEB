import type { Failure } from '@/core/api/FailureResponse'
import * as E from 'fp-ts/Either'
import { AgendaDatasourceImpl } from '@/features/meeting/datasources/AgendaDatasource'
import type { AgendaDeleteResponse, AgendaSaveResponse, AgendaTaskSaveResponse, AddAgendaTaskRequest, DeleteAgendaRequest, FilterWithPaginationAgendaRequest, FilterWithPaginationPreviousAgendaDetailsRequest, AgendaListResponse, PreviousAgendaDetailsResponse } from '@/features/meeting/models/AgendaModel'

const agendaDatasource = new AgendaDatasourceImpl()

export const agendaService = {

    apiCallPullAgenda: async (params: FilterWithPaginationAgendaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AgendaListResponse>> => {
        try {

            return E.right(await agendaDatasource.pullAgenda(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateAgenda: async (formData: FormData): Promise<E.Either<Failure, AgendaSaveResponse>> => {
        try {

            return E.right(await agendaDatasource.addUpdateAgenda(formData))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddAgendaTask: async (params: AddAgendaTaskRequest): Promise<E.Either<Failure, AgendaTaskSaveResponse>> => {
        try {

            return E.right(await agendaDatasource.addAgendaTask(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteAgenda: async (params: DeleteAgendaRequest): Promise<E.Either<Failure, AgendaDeleteResponse>> => {
        try {

            return E.right(await agendaDatasource.deleteAgenda(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullPreviousAgendaDetails: async (params: FilterWithPaginationPreviousAgendaDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PreviousAgendaDetailsResponse>> => {
        try {

            return E.right(await agendaDatasource.pullPreviousAgendaDetails(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },
}
