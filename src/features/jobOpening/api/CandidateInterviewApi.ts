export const CandidateInterviewApi = {
    PULL: '/CandidateProcess/PullCandidateInterview',
    ADD_UPDATE: '/CandidateProcess/ScheduleInterview',
} as const

export type CandidateInterviewApiKeys = keyof typeof CandidateInterviewApi
