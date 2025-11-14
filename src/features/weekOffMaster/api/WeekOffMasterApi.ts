export const WeekOffMasterApi = {
    PULL: '/WeekOffPolicyMaster/PullWeekOffPolicyMaster',
    ADD_UPDATE: '/WeekOffPolicyMaster/AddUpdateWeekOffPolicyMaster',
    DELETE: '/WeekOffPolicyMaster/DeleteWeekOffPolicyMaster'
} as const

export type WeekOffMasterApiKeys = keyof typeof WeekOffMasterApi