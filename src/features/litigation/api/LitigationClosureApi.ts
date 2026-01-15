export const LitigationClosureApi = {
    
    PULL_CLOSURE: '/Litigation/PullLitigationClosure',
    ADD_UPDATE_CLOSURE: '/Litigation/AddUpdateLitigationClosure',

} as const

export type LitigationClosureApiKeys = keyof typeof LitigationClosureApi