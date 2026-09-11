export const CandidateInterviewApi = {
    PULL: '/CandidateProcess/PullCandidateInterview',
    ADD_UPDATE: '/CandidateProcess/ScheduleInterview',
    PULL_TIMELINE: '/CandidateProcess/PullCandidateApplicationTimeline',
    PULL_STAGE: '/CandidateProcess/PullCandidateApplicationStage',
} as const

export type CandidateInterviewApiKeys = keyof typeof CandidateInterviewApi
