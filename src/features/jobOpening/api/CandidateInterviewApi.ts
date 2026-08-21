export const CandidateInterviewApi = {
    PULL: '/CandidateProcess/PullCandidateInterview',
    ADD_UPDATE: '/CandidateProcess/ScheduleInterview',
    PULL_TIMELINE: '/CandidateProcess/PullCandidateApplicationTimeline',
} as const

export type CandidateInterviewApiKeys = keyof typeof CandidateInterviewApi
