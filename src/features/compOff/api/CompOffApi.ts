export const CompOffApi = {
    PULL: '/CompOff/PullCompOff',
    ADD_UPDATE: '/CompOff/AddUpdateCompOff',
    DELETE: '/CompOff/DeleteCompOff',
    PULL_COMP_OFF_DATES: '/CompOff/PullCompOffDates'
} as const

export type CompOffApiKeys = keyof typeof CompOffApi
