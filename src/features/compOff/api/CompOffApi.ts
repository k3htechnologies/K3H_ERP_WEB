export const CompOffApi = {
    PULL: '/CompOff/PullCompOff',
    ADD_UPDATE: '/CompOff/AddUpdateCompOff',
    DELETE: '/CompOff/DeleteCompOff',
} as const

export type CompOffApiKeys = keyof typeof CompOffApi

