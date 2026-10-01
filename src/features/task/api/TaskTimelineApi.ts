export const TaskTimelineApi = {
    PULL: '/TaskTimeline/PullTaskTimeline',
} as const

export type TaskTimelineApiKeys = keyof typeof TaskTimelineApi
