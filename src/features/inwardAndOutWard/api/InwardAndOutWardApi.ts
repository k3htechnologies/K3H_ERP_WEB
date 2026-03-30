export const InwardApi={
    PULL:'/InwardAndOutWard/PullInward',
    ADD_UPDATE:'/InwardAndOutWard/AddUpdateInward',
    DELETE:'/InwardAndOutWard/DeleteInward',
} as const

export type InwardApiKeys = keyof typeof InwardApi;