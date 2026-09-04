export const CandidateApi = {
    PULL: '/CandidateDetails/PullCandidateDetails',
    ADD_UPDATE_REMARK: '/CandidateDetails/AddUpdateCandidateRemark',
    PULL_REMARK: '/CandidateDetails/PullCandidateRemark',
    UPDATE_STAGE: '/CandidateDetails/UpdateCanditateSelectionStage',
} as const

export type CandidateApiKeys = keyof typeof CandidateApi
