export const TaskApi = {
    PULL_TASK_PRIORITY: '/Task/PullTaskPriority',
    PULL_TASK_INITIAL_STATUS: '/Task/PullTaskStatus',
    PULL: '/Task/PullTask',
    ADD_UPDATE: '/Task/AddUpdateTask',
    DELETE: '/Task/DeleteTask',
    PULL_TASK_TAG: '/Task/PullTaskTag',
} as const

export type TaskApiKeys = keyof typeof TaskApi
