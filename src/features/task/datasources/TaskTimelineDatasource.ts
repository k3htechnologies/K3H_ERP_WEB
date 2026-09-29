import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TaskTimelineApi } from '@/features/task/api/TaskTimelineApi'
import type {
    FilterWithPaginationTaskTimelineRequest,
    TaskTimelineListResponse,
} from '@/features/task/models/TaskTimelineModel'

export abstract class TaskTimelineDatasource {
    abstract pullTaskTimeline(params: FilterWithPaginationTaskTimelineRequest,signal?: AbortSignal): Promise<TaskTimelineListResponse>
}

export class TaskTimelineDatasourceImpl implements TaskTimelineDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTaskTimeline(params: FilterWithPaginationTaskTimelineRequest,signal?: AbortSignal): Promise<TaskTimelineListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.TaskId) queryParams.append('TaskId', params.TaskId.toString())
            if (params.ActivityType?.trim()) {
                queryParams.append('ActivityType', params.ActivityType.trim())
            }
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaskTimelineApi.PULL}?${queryParams.toString()}`,
                { signal },
            )

            return response
        } catch (error) {
            console.error('ERROR: PULL TASK TIMELINE :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTaskTimeline(params, signal)
            }

            throw error
        }
    }
}
