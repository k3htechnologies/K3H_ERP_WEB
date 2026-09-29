import type { ApiResponse } from '@/core/api/ApiResponse'

export interface TaskTimelineData {
    TaskTimelineId: number
    TaskId: number
    TaskTitle?: string | null
    ActivityType?: string | null
    ActivityTitle?: string | null
    OldValue?: string | null
    NewValue?: string | null
    ClientRegistrationId?: number
    CreatedById?: number
    CreatedBy?: string | null
    CreatedByName?: string | null
    CreatedDate?: string | null
}

export interface FilterWithPaginationTaskTimelineRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    TaskId?: number | null
    ActivityType?: string | null
    SortBy?: string | null
}

export type TaskTimelineListResponse = ApiResponse<TaskTimelineData[]>
