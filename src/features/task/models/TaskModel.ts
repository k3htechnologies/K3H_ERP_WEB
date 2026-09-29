import type { ApiResponse } from '@/core/api/ApiResponse'
import type { TASK_TYPE } from '@/features/task/constants/taskConstants'

export type TaskTypeValue = (typeof TASK_TYPE)[keyof typeof TASK_TYPE]

export interface ReviewerDetail {
    ReviewerId: string
    ReviewerName: string
}

export interface TagsEmployeeDetail {
    TagId: string
    TagsName: string
}

export interface TaskDetails {
    TaskId: number
    UniqueKey: string | null
    ModuleAbbreviationId: string | ''
    SystemGeneratedCode: string | ''
    ParentTaskId: number | null
    ParentTaskTitle: string | ''
    TaskType: TaskTypeValue | ''
    TaskTitle: string | ''
    TaskDescription: string | ''
    TaskPriorityId: number | 0
    TaskPriority: string | number | ''
    TaskInitialStatusId: number | 0
    TaskInitialStatus: string | number | ''
    AssigneeId: number | 0
    AssigneeName: string | ''
    SubTaskProgressPercentage: number | 0
    ReviewerDetails: ReviewerDetail[]
    TagsEmployeeDetails: TagsEmployeeDetail[]
    StartDate: string | null
    DueDate: string | null
    DocumentUrl: string | ''
    ClientRegistrationId: number | 0
    CreatedById: number | 0
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedDate: string | null
    CreatedBy: string | ''
    ModifiedBy: string | ''
    DeletedBy: string | ''
    DeletedById: number | 0
    DeletedDate: string | null
    Priority: string | ''
    CommentCount: number | 0
    AttachmentCount: number | 0
    MeetingId: number | 0
}

export interface TaskPriorityData {
    TaskPriorityId: number | 0
    Priority: string | ''
    PriorityId: number | 0
}

export interface TaskInitialStatusData {
    TaskStatusId: number | 0
    Status: string | ''
}

export interface AddUpdateTaskDetailsRequest {
    TaskId?: number
    UniqueKey?: string | null
    ParentTaskId?: number | null
    TaskType?: string
    TaskTitle?: string
    TaskDescription?: string
    TaskPriorityId?: number
    TaskInitialStatusId?: number
    AssigneeId?: number
    ReviewerJson?: string
    TagsEmployeeJson?: string
    StartDate?: string | null
    DueDate?: string | null
    DocumentUrl?: string | null
    RemoveDocumentUrl?: string | null
    MeetingId?: number
    ResponsiblePersonJson?: string
}

export interface FilterWithPaginationTaskDetailsRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    TaskId?: number
    ParentTaskId?: number
    TaskType?: TaskTypeValue | string
    TaskTitle?: string
    AssigneeId?: number
    TaskPriorityId?: string | number
    TaskInitialStatusId?: string | number
    StartDate?: string | null
    DueDate?: string | null
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface DeleteTaskDetailsRequest {
    TaskId: number
    UniqueKey?: string | null
}

export interface TaskTagData {
    TagId: number | 0
    TagsName: string | ''
    TaskId: number | 0
}

export interface FilterWithPaginationTaskTagRequest {
    PageSize: number
    PageNumber: number
    TaskId?: number
    TagId?: number
    TagsName?: string
}

export type TaskListResponse = ApiResponse<TaskDetails[]>
export type TaskSaveResponse = ApiResponse<TaskDetails[]>
export type TaskDeleteResponse = ApiResponse<number>
export type TaskPriorityListResponse = ApiResponse<TaskPriorityData[]>
export type TaskInitialStatusListResponse = ApiResponse<TaskInitialStatusData[]>
export type TaskTagListResponse = ApiResponse<TaskTagData[]>
