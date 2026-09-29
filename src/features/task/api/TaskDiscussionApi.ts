export const TaskDiscussionApi = {
    PULL: '/Task/PullTaskDiscussion',
    ADD_UPDATE: '/Task/AddUpdateDiscussion',
} as const

export type TaskDiscussionApiKeys = keyof typeof TaskDiscussionApi
