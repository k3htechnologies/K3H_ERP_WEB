import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type {
    DeleteTaskDetailsRequest,
    FilterWithPaginationTaskDetailsRequest,
    FilterWithPaginationTaskTagRequest,
    TaskDeleteResponse,
    TaskInitialStatusListResponse,
    TaskListResponse,
    TaskPriorityListResponse,
    TaskSaveResponse,
    TaskTagListResponse,
} from '@/features/task/models/TaskModel'
import { TaskApi } from '@/features/task/api/TaskApi'

export abstract class TaskDatasource {
    abstract pullTaskPriority(signal?: AbortSignal): Promise<TaskPriorityListResponse>
    abstract pullTaskInitialState(signal?: AbortSignal): Promise<TaskInitialStatusListResponse>
    abstract pullTask(params: FilterWithPaginationTaskDetailsRequest, signal?: AbortSignal): Promise<TaskListResponse>
    abstract pullTaskTag(params: FilterWithPaginationTaskTagRequest,signal?: AbortSignal): Promise<TaskTagListResponse>
    abstract addUpdateTask(data: FormData): Promise<TaskSaveResponse>
    abstract deleteTask(params: DeleteTaskDetailsRequest): Promise<TaskDeleteResponse>
}

export class TaskDatasourceImpl implements TaskDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTaskPriority(signal?: AbortSignal): Promise<TaskPriorityListResponse> {
        try {
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                TaskApi.PULL_TASK_PRIORITY,
                { signal },
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL TASK PRIORITY :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTaskPriority(signal)
            }

            throw error
        }
    }

    async pullTaskInitialState(signal?: AbortSignal): Promise<TaskInitialStatusListResponse> {
        try {
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                TaskApi.PULL_TASK_INITIAL_STATUS,
                { signal },
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL TASK INITIAL STATUS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTaskInitialState(signal)
            }

            throw error
        }
    }

    async pullTask(params: FilterWithPaginationTaskDetailsRequest,signal?: AbortSignal): Promise<TaskListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.TaskType) queryParams.append('TaskType', String(params.TaskType))
            if (params.TaskTitle?.trim()) queryParams.append('TaskTitle', params.TaskTitle.trim())
            if (params.TaskId) queryParams.append('TaskId', params.TaskId.toString())
            if (params.ParentTaskId) queryParams.append('ParentTaskId', params.ParentTaskId.toString())
            if (params.StartDate) queryParams.append('StartDate', params.StartDate)
            if (params.DueDate) queryParams.append('DueDate', params.DueDate)
            if (params.TaskPriorityId) queryParams.append('TaskPriorityId', String(params.TaskPriorityId))
            if (params.TaskInitialStatusId) {
                queryParams.append('TaskInitialStatusId', String(params.TaskInitialStatusId))
            }
            if (params.AssigneeId) queryParams.append('AssigneeId', params.AssigneeId.toString())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaskApi.PULL}?${queryParams.toString()}`,
                { signal },
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL TASK DATA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTask(params, signal)
            }

            throw error
        }
    }

    async pullTaskTag(params: FilterWithPaginationTaskTagRequest, signal?: AbortSignal): Promise<TaskTagListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.TaskId) queryParams.append('TaskId', params.TaskId.toString())
            if (params.TagId) queryParams.append('TagId', params.TagId.toString())
            if (params.TagsName?.trim()) queryParams.append('TagsName', params.TagsName.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaskApi.PULL_TASK_TAG}?${queryParams.toString()}`,
                { signal },
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL TASK TAG DATA :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTaskTag(params, signal)
            }

            throw error
        }
    }

    async addUpdateTask(data: FormData): Promise<TaskSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TaskApi.ADD_UPDATE,
                data,
            )

            return response
        } catch (error: any) {
            console.error('ERROR: ADD UPDATE TASK :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTask(data)
            }

            throw error
        }
    }

    async deleteTask(params: DeleteTaskDetailsRequest): Promise<TaskDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TaskId: (params.TaskId ?? 0).toString(),
                UniqueKey: (params.UniqueKey ?? '').toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TaskApi.DELETE}?${queryParams.toString()}`,
            )

            return response
        } catch (error: any) {
            console.error('ERROR: DELETE TASK :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTask(params)
            }

            throw error
        }
    }
}
