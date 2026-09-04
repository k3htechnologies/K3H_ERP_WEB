export const GatePassApi = {
    PULL: '/GatePass/PullGatePass',
    ADD_UPDATE: '/GatePass/AddUpdateGatePass',
    UPDATE_OUT: '/GatePass/UpdateGatePassOut',
    DELETE: '/GatePass/DeleteGatePass'
} as const

export type GatePassApiKeys = keyof typeof GatePassApi