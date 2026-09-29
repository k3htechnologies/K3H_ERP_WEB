import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AgendaApi } from '@/features/meeting/api/AgendaApi'
import type { AgendaDeleteResponse, AgendaSaveResponse, AgendaTaskSaveResponse, AddAgendaTaskRequest, DeleteAgendaRequest, FilterWithPaginationAgendaRequest, FilterWithPaginationPreviousAgendaDetailsRequest, AgendaListResponse, PreviousAgendaDetailsResponse } from '@/features/meeting/models/AgendaModel'

export abstract class AgendaDatasource {

    abstract pullAgenda(params: FilterWithPaginationAgendaRequest, signal?: AbortSignal): Promise<AgendaListResponse>
    abstract addUpdateAgenda(formData: FormData): Promise<AgendaSaveResponse>
    abstract addAgendaTask(params: AddAgendaTaskRequest): Promise<AgendaTaskSaveResponse>
    abstract deleteAgenda(params: DeleteAgendaRequest): Promise<AgendaDeleteResponse>
    abstract pullPreviousAgendaDetails(params: FilterWithPaginationPreviousAgendaDetailsRequest, signal?: AbortSignal): Promise<PreviousAgendaDetailsResponse>
}

export class AgendaDatasourceImpl implements AgendaDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullAgenda(params: FilterWithPaginationAgendaRequest, signal?: AbortSignal): Promise<AgendaListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize ?? 10),
                PageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.MeetingId != null && params.MeetingId > 0) {
                queryParams.append('MeetingId', String(params.MeetingId))
            }
            if (params.AgendaId != null && params.AgendaId > 0) {
                queryParams.append('AgendaId', String(params.AgendaId))
            }
            if (params.AgendaSource?.trim()) {
                queryParams.append('AgendaSource', params.AgendaSource.trim())
            }
            if (params.TaskType?.trim()) {
                queryParams.append('TaskType', params.TaskType.trim())
            }
            if (params.IsAgendaTask != null) {
                queryParams.append('IsAgendaTask', String(params.IsAgendaTask))
            }
            if (params.ParentTaskId != null && params.ParentTaskId > 0) {
                queryParams.append('ParentTaskId', String(params.ParentTaskId))
            }
            if (params.AgendaParentId != null && params.AgendaParentId > 0) {
                queryParams.append('AgendaParentId', String(params.AgendaParentId))
            }
            if (params.AgendaTitle?.trim()) {
                queryParams.append('AgendaTitle', params.AgendaTitle.trim())
            }
            if (params.PriorityId != null && params.PriorityId > 0) {
                queryParams.append('PriorityId', String(params.PriorityId))
            }
            if (params.StatusId != null && params.StatusId > 0) {
                queryParams.append('StatusId', String(params.StatusId))
            }
            if (params.StartDate?.trim()) {
                queryParams.append('StartDate', params.StartDate.trim())
            }
            if (params.DueDate?.trim()) {
                queryParams.append('DueDate', params.DueDate.trim())
            }
            if (params.SortBy?.trim()) {
                queryParams.append('SortBy', params.SortBy.trim())
            }
            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AgendaApi.PULL}?${queryParams.toString()}`,
                { signal },
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

    async addUpdateAgenda(formData: FormData): Promise<AgendaSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                AgendaApi.ADD_UPDATE,
                formData,
            )

            return response

        } catch (error) {
            console.error('ERROR: ADD UPDATE AGENDA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateAgenda(formData)
            }

            throw error
        }
    }

    async addAgendaTask(params: AddAgendaTaskRequest): Promise<AgendaTaskSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                AgendaApi.ADD_AGENDA_TASK,
                params,
            )

            return response

        } catch (error) {
            console.error('ERROR: ADD AGENDA TASK :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addAgendaTask(params)
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

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${AgendaApi.DELETE}?${queryParams.toString()}`,
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

    async pullPreviousAgendaDetails(params: FilterWithPaginationPreviousAgendaDetailsRequest, signal?: AbortSignal): Promise<PreviousAgendaDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize ?? 10),
                PageNumber: String(params.PageNumber ?? 1),
                meetingId: String(params.meetingId),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.AgendaTitle?.trim()) {
                queryParams.append('AgendaTitle', params.AgendaTitle.trim())
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AgendaApi.PULL_PREVIOUS}?${queryParams.toString()}`,
                { signal },
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
}
