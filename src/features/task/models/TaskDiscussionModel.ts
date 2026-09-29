import type { ApiResponse } from '@/core/api/ApiResponse'
import type { DISCUSSION_SORT_OPTIONS } from '@/features/task/constants/taskConstants'

export type DiscussionSortOrder = (typeof DISCUSSION_SORT_OPTIONS)[number]['value']

export interface TaskDiscussionData {
    TaskDiscussionId: number
    UniqueKey?: string | null
    TaskId: number
    Discussion?: string
    DiscussionDocumentURL?: string | null
    CreatedById?: number
    CreatedBy?: string | null
    ProfilePhotoURL?: string | null
    CreatedDate?: string | null
    ModifiedById?: number
    ModifiedDate?: string | null
    LikeCount?: number
}

export interface FilterWithPaginationTaskDiscussionRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    TaskDiscussionId?: number
    TaskId?: number
    SortBy?: number
}

export interface TaskMentionUser {
    id: string
    name: string
}

export type TaskDiscussionListResponse = ApiResponse<TaskDiscussionData[]>
export type TaskDiscussionSaveResponse = ApiResponse<TaskDiscussionData[]>
