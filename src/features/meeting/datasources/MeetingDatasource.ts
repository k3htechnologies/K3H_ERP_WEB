import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { MeetingApi } from '@/features/meeting/api/MeetingApi'
import type { AddUpdateMeetingMasterRequest, DeleteMeetingMasterRequest, FilterWithPaginationMeetingMasterRequest, FilterWithPaginationMeetingParticipantsRequest, MeetingMasterDeleteResponse, MeetingMasterListResponse, MeetingMasterSaveResponse, MeetingParticipantListResponse } from '@/features/meeting/models/MeetingModel'

export abstract class MeetingDatasource {

    abstract pullMeetingMaster(params: FilterWithPaginationMeetingMasterRequest, signal?: AbortSignal): Promise<MeetingMasterListResponse>
    abstract pullMeetingParticipants(params: FilterWithPaginationMeetingParticipantsRequest, signal?: AbortSignal): Promise<MeetingParticipantListResponse>
    abstract addUpdateMeetingMaster(params: AddUpdateMeetingMasterRequest): Promise<MeetingMasterSaveResponse>
    abstract deleteMeetingMaster(params: DeleteMeetingMasterRequest): Promise<MeetingMasterDeleteResponse>
}

export class MeetingDatasourceImpl implements MeetingDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullMeetingMaster(params: FilterWithPaginationMeetingMasterRequest, signal?: AbortSignal): Promise<MeetingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.MeetingId) queryParams.append('MeetingId', params.MeetingId.toString())
            if (params.MeetingName?.trim()) queryParams.append('MeetingName', params.MeetingName.trim())
            if (params.MeetingTitle?.trim()) queryParams.append('MeetingTitle', params.MeetingTitle.trim())
            if (params.MeetingDate?.trim()) queryParams.append('MeetingDate', params.MeetingDate.trim())
            if (params.MeetingStatus?.trim()) queryParams.append('MeetingStatus', params.MeetingStatus.trim())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.ExportType?.trim()) queryParams.append('ExportType', params.ExportType.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL}?${queryParams.toString()}`,
                { signal },
            )

            return response

        } catch (error: any) {
            console.error('ERROR: PULL MEETING MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullMeetingMaster(params, signal)
            }

            throw error
        }
    }

    async pullMeetingParticipants(
        params: FilterWithPaginationMeetingParticipantsRequest,
        signal?: AbortSignal,
    ): Promise<MeetingParticipantListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                MeetingId: (params.MeetingId ?? 0).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL_PARTICIPANTS}?${queryParams.toString()}`,
                { signal },
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL MEETING PARTICIPANTS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullMeetingParticipants(params, signal)
            }

            throw error
        }
    }

    async addUpdateMeetingMaster(params: AddUpdateMeetingMasterRequest): Promise<MeetingMasterSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                MeetingApi.ADD_UPDATE,
                params,
            )

            return response

        } catch (error) {
            console.error('ERROR: ADD UPDATE MEETING MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateMeetingMaster(params)
            }

            throw error
        }
    }

    async deleteMeetingMaster(params: DeleteMeetingMasterRequest): Promise<MeetingMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MeetingId: (params.MeetingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MeetingApi.DELETE}?${queryParams.toString()}`,
            )

            return response

        } catch (error) {
            console.error('ERROR: DELETE MEETING MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteMeetingMaster(params)
            }

            throw error
        }
    }
}
