import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { MeetingApi } from '@/features/event/meeting/api/MeetingApi'
import type {
    AddUpdateMOMDocumentsRequest,
    AddUpdateMeetingMasterRequest,
    AddUpdateAgendaRequest,
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

export abstract class MeetingDatasource {

    abstract pullMeetingMaster(params: PullMeetingMasterRequest, signal?: AbortSignal): Promise<MeetingMasterListResponse>
    abstract addUpdateMeetingMaster(params: AddUpdateMeetingMasterRequest): Promise<MeetingMasterSaveResponse>
    abstract deleteMeetingMaster(params: DeleteMeetingMasterRequest): Promise<MeetingMasterDeleteResponse>
    abstract pullMOM(params: PullMOMRequest, signal?: AbortSignal): Promise<MOMDocumentListResponse>
    abstract addUpdateMOMDocuments(params: AddUpdateMOMDocumentsRequest): Promise<MOMDocumentSaveResponse>
    abstract deleteMOM(params: DeleteMOMRequest): Promise<MOMDocumentDeleteResponse>
    abstract addUpdateAgenda(params: AddUpdateAgendaRequest): Promise<AgendaSaveResponse>
    abstract deleteAgenda(params: DeleteAgendaRequest): Promise<AgendaDeleteResponse>
    abstract pullPreviousAgendaDetails(params: PullPreviousAgendaDetailsRequest, signal?: AbortSignal): Promise<PreviousAgendaDetailsResponse>
    abstract pullAgenda(params: PullAgendaRequest, signal?: AbortSignal): Promise<PullAgendaResponse>
}

export class MeetingDatasourceImpl implements MeetingDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullMeetingMaster(params: PullMeetingMasterRequest, signal?: AbortSignal): Promise<MeetingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: params.PageSize.toString(),
                pageNumber: params.PageNumber.toString(),
            })

            if (params.MeetingId) queryParams.append('MeetingId', params.MeetingId.toString())
            if (params.MeetingName?.trim()) queryParams.append('MeetingName', params.MeetingName.trim())
            if (params.MeetingTitle?.trim()) queryParams.append('MeetingTitle', params.MeetingTitle.trim())
            if (params.MeetingDate?.trim()) queryParams.append('MeetingDate', params.MeetingDate.trim())
            if (params.MeetingStatus?.trim()) queryParams.append('MeetingStatus', params.MeetingStatus.trim())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.ExportType?.trim()) queryParams.append('ExportType', params.ExportType.trim())

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

        } catch (error: any) {
            console.error('ERROR: PULL MEETING MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullMeetingMaster(params, signal)
            }

            throw error
        }
    }

    async addUpdateMeetingMaster(params: AddUpdateMeetingMasterRequest): Promise<MeetingMasterSaveResponse> {
        try {
            const response= await this.k3hHttpClient.postRequestWithAuthentication(
                MeetingApi.ADD_UPDATE,
                params
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
            const payload = new URLSearchParams({
                MeetingId: (params.MeetingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

             const response= await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MeetingApi.DELETE}?${payload.toString()}`
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

    async pullMOM(params: PullMOMRequest, signal?: AbortSignal): Promise<MOMDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: params.PageSize.toString(),
                PageNumber: params.PageNumber.toString(),
                MOMId: params.MOMId.toString(),
                MeetingId: params.MeetingId.toString(),
                ExportType: params.ExportType.trim(),
            })

             const response= await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL_MOM}?${queryParams.toString()}`,
                { signal }
            )

             return response

        } catch (error: any) {
            console.error('ERROR: PULL MOM :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullMOM(params, signal)
            }

            throw error
        }
    }

    async addUpdateMOMDocuments(params: AddUpdateMOMDocumentsRequest): Promise<MOMDocumentSaveResponse> {
        try {
            const queryParams = new URLSearchParams({
                MomDocumentId: String(params.MomDocumentId),
                UniqueKey: params.UniqueKey,
                RemovePresentationDocumentUrl: params.RemovePresentationDocumentUrl ?? '',
                RemoveMOMDocumentUrl: params.RemoveMOMDocumentUrl ?? '',
                RemoveSupportingDocumentUrl: params.RemoveSupportingDocumentUrl ?? '',
                MeetingId: String(params.MeetingId),
            })

             const response= await this.k3hHttpClient.multipartRequestWithAuthentication(
                `${MeetingApi.ADD_UPDATE_MOM}?${queryParams.toString()}`,
                params.FormData
            )

             return response

        } catch (error) {
            console.error('ERROR: ADD UPDATE MOM DOCUMENTS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateMOMDocuments(params)
            }

            throw error
        }
    }

    async deleteMOM(params: DeleteMOMRequest): Promise<MOMDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MOMId: (params.MOMId ?? 0).toString(),
            })

             const response= await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MeetingApi.DELETE_MOM}?${queryParams.toString()}`
            )

             return response

        } catch (error) {
            console.error('ERROR: DELETE MOM :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteMOM(params)
            }

            throw error
        }
    }

    async addUpdateAgenda(params: AddUpdateAgendaRequest): Promise<AgendaSaveResponse> {
        try {
            const formData = new FormData()

            formData.append('AgendaId', String(params.AgendaId))
            formData.append('UniqueKey', params.UniqueKey)
            formData.append('MeetingId', String(params.MeetingId))
            formData.append('AgendaTitle', params.AgendaTitle)
            formData.append('AgendaDescription', params.AgendaDescription)
            formData.append('ResponsiblePersonJson', params.ResponsiblePersonJson ?? '')
            formData.append('Priority', params.Priority)
            formData.append('AgendaStatus', params.AgendaStatus)
            formData.append('Remark', params.Remark)
            formData.append('AgendaConclusion', params.AgendaConclusion)
            formData.append('Discussion', params.Discussion)
            formData.append('Description', params.Description)
            formData.append('RemoveDocumentURL', params.RemoveDocumentURL ?? '')

            params.DocumentURLs.forEach((document) => {
                if (document instanceof File) {
                    formData.append('DocumentURLs', document, document.name)
                }
            })

            const response= await this.k3hHttpClient.multipartRequestWithAuthentication(
                MeetingApi.ADD_UPDATE_AGENDA,
                formData
            )

            return response

        } catch (error) {
            console.error('ERROR: ADD UPDATE AGENDA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateAgenda(params)
            }

            throw error
        }
    }

    async deleteAgenda(params: DeleteAgendaRequest): Promise<AgendaDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                AgendaId: params.AgendaId.toString(),
                UniqueKey: params.UniqueKey,
            })

            const response= await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MeetingApi.DELETE_AGENDA}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            console.error('ERROR: DELETE AGENDA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteAgenda(params)
            }

            throw error
        }
    }

    async pullPreviousAgendaDetails(params: PullPreviousAgendaDetailsRequest, signal?: AbortSignal): Promise<PreviousAgendaDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize),
                pageNumber: String(params.PageNumber),
                meetingId: String(params.meetingId),
            })

            const response= await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL_PREVIOUS_AGENDA}?${queryParams.toString()}`,
                { signal }
            )

            return response

        } catch (error: any) {
            console.error('ERROR: PULL PREVIOUS AGENDA DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullPreviousAgendaDetails(params, signal)
            }

            throw error
        }
    }

    async pullAgenda(params: PullAgendaRequest, signal?: AbortSignal): Promise<PullAgendaResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: params.PageSize.toString(),
                PageNumber: params.PageNumber.toString(),
                meetingId: params.meetingId.toString(),
                AgendaSource: params.AgendaSource,
            })

             const response= await this.k3hHttpClient.getRequestWithAuthentication(
                `${MeetingApi.PULL_AGENDA}?${queryParams.toString()}`,
                { signal }
            )

            return response

        } catch (error: any) {
            console.error('ERROR: PULL AGENDA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullAgenda(params, signal)
            }

            throw error
        }
    }
}
