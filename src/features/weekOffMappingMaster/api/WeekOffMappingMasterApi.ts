export const WeekOffMappingMasterApi = {
    PULL: '/WeekOffPolicyMasterMapping/PullWeekOffPolicyMasterMapping',
    ADD_UPDATE: '/WeekOffPolicyMasterMapping/AddUpdateWeekOffPolicyMasterMapping',
    DELETE: '/WeekOffPolicyMasterMapping/AddUpdateWeekOffPolicyMasterMapping'
} as const

export type WeekOffMappingMasterApiKeys = keyof typeof WeekOffMappingMasterApi