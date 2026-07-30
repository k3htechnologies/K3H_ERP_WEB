export const JobOpeningApi = {
    PULL: '/JobOpening/PullJobOpeningMaster',
    ADD_UPDATE: '/JobOpening/AddUpdateJobOpeningMaster',
    DELETE: '/JobOpening/DeleteJobOpeningMaster',
    PULL_CANDIDATES: '/CandidateDetails/PullCandidateDetails',
    ADD_UPDATE_CANDIDATE_REMARK: '/CandidateDetails/AddUpdateCandidateRemark',
    PULL_CANDIDATE_REMARK: '/CandidateDetails/PullCandidateRemark',
    UPDATE_CANDIDATE_STAGE: '/CandidateDetails/UpdateCanditateSelectionStage',
    PULL_CANDIDATE_TIMELINE: '/CandidateProcess/PullCandidateApplicationTimeline',
    SCHEDULE_INTERVIEW: '/CandidateProcess/ScheduleInterview',
    PULL_CANDIDATE_INTERVIEWS: '/CandidateProcess/PullCandidateInterview'
} as const

export type JobOpeningApiKeys = keyof typeof JobOpeningApi
