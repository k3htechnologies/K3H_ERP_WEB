import type { Failure } from '@/core/api/FailureResponse'
import { MeetingDatasourceImpl } from '@/features/event/meeting/datasources/MeetingDatasource'
import type {
    AddUpdateAgendaRequest,
    AddUpdateMOMDocumentsRequest,
    AddUpdateMeetingMasterRequest,
    AgendaDeleteResponse,
    AgendaSaveResponse,
    DeleteMeetingMasterRequest,
    DeleteAgendaRequest,
    DeleteMOMRequest,
    PullMeetingMasterRequest,
    PullMOMRequest,
    MeetingMasterDeleteResponse,
    MeetingMasterListResponse,
    MeetingMasterSaveResponse,
    MOMDocumentDeleteResponse,
    MOMDocumentListResponse,
    MOMDocumentSaveResponse,
    PreviousAgendaDetailsResponse,
    PullPreviousAgendaDetailsRequest,
    PullAgendaRequest,
    PullAgendaResponse
} from '@/features/event/meeting/models/MeetingModel'
import * as E from 'fp-ts/Either'

const meetingDatasource = new MeetingDatasourceImpl()

export const MeetingService = {

    apiCallPullMeetingMaster: async (params: PullMeetingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MeetingMasterListResponse>> => {
        try {

            return E.right(await meetingDatasource.pullMeetingMaster(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateMeetingMaster: async (params: AddUpdateMeetingMasterRequest): Promise<E.Either<Failure, MeetingMasterSaveResponse>> => {
        try {

            return E.right(await meetingDatasource.addUpdateMeetingMaster(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteMeetingMaster: async (params: DeleteMeetingMasterRequest): Promise<E.Either<Failure, MeetingMasterDeleteResponse>> => {
        try {

            return E.right(await meetingDatasource.deleteMeetingMaster(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullMOM: async (params: PullMOMRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MOMDocumentListResponse>> => {
        try {

            return E.right(await meetingDatasource.pullMOM(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateMOMDocuments: async (params: AddUpdateMOMDocumentsRequest): Promise<E.Either<Failure, MOMDocumentSaveResponse>> => {
        try {

            return E.right(await meetingDatasource.addUpdateMOMDocuments(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteMOM: async (params: DeleteMOMRequest): Promise<E.Either<Failure, MOMDocumentDeleteResponse>> => {
        try {

            return E.right(await meetingDatasource.deleteMOM(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateAgenda: async (params: AddUpdateAgendaRequest): Promise<E.Either<Failure, AgendaSaveResponse>> => {
        try {

            return E.right(await meetingDatasource.addUpdateAgenda(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteAgenda: async (params: DeleteAgendaRequest): Promise<E.Either<Failure, AgendaDeleteResponse>> => {
        try {

            return E.right(await meetingDatasource.deleteAgenda(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullPreviousAgendaDetails: async (params: PullPreviousAgendaDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PreviousAgendaDetailsResponse>> => {
        try {

            return E.right(await meetingDatasource.pullPreviousAgendaDetails(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullAgenda: async (params: PullAgendaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullAgendaResponse>> => {
        try {

            return E.right(await meetingDatasource.pullAgenda(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },
}
