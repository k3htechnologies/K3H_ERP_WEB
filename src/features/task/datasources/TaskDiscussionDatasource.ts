import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TaskDiscussionApi } from '@/features/task/api/TaskDiscussionApi'
import type {
    FilterWithPaginationTaskDiscussionRequest,
    TaskDiscussionListResponse,
    TaskDiscussionSaveResponse,
} from '@/features/task/models/TaskDiscussionModel'

export abstract class TaskDiscussionDatasource {
    abstract pullTaskDiscussion(params: FilterWithPaginationTaskDiscussionRequest, signal?: AbortSignal): Promise<TaskDiscussionListResponse>
    abstract addUpdateTaskDiscussion(params: FormData): Promise<TaskDiscussionSaveResponse>
}

export class TaskDiscussionDatasourceImpl implements TaskDiscussionDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTaskDiscussion( params: FilterWithPaginationTaskDiscussionRequest, signal?: AbortSignal): Promise<TaskDiscussionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.TaskDiscussionId) {
                queryParams.append('TaskDiscussionId', params.TaskDiscussionId.toString())
            }
            if (params.TaskId) queryParams.append('TaskId', params.TaskId.toString())
            if (params.SortBy != null) queryParams.append('SortBy', params.SortBy.toString())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaskDiscussionApi.PULL}?${queryParams.toString()}`,
                { signal },
            )

            return response
        } catch (error) {
            console.error('ERROR: PULL TASK DISCUSSION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTaskDiscussion(params, signal)
            }

            throw error
        }
    }

    async addUpdateTaskDiscussion(params: FormData): Promise<TaskDiscussionSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TaskDiscussionApi.ADD_UPDATE,
                params,
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE TASK DISCUSSION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTaskDiscussion(params)
            }

            throw error
        }
    }
}
