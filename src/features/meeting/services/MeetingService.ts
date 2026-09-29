import type { Failure } from '@/core/api/FailureResponse'
import * as E from 'fp-ts/Either'
import { MeetingDatasourceImpl } from '@/features/meeting/datasources/MeetingDatasource'
import type { AddUpdateMeetingMasterRequest, DeleteMeetingMasterRequest, FilterWithPaginationMeetingMasterRequest, FilterWithPaginationMeetingParticipantsRequest, MeetingMasterDeleteResponse, MeetingMasterListResponse, MeetingMasterSaveResponse, MeetingParticipantListResponse } from '@/features/meeting/models/MeetingModel'

const meetingDatasource = new MeetingDatasourceImpl()

export const meetingService = {

    apiCallPullMeetingMaster: async (params: FilterWithPaginationMeetingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MeetingMasterListResponse>> => {
        try {

            return E.right(await meetingDatasource.pullMeetingMaster(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullMeetingParticipants: async ( params: FilterWithPaginationMeetingParticipantsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MeetingParticipantListResponse>> => {
        try {

            return E.right(await meetingDatasource.pullMeetingParticipants(params, options?.signal))

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
}
