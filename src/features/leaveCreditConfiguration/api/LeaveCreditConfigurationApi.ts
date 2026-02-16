export const LeaveCreditConfigurationApi = {
    PULL: '/LeaveCreditConfiguration/PullLeaveCreditConfiguration',
    ADD_UPDATE: '/LeaveCreditConfiguration/AddUpdateLeaveCreditConfiguration',
    DELETE: '/LeaveCreditConfiguration/DeleteLeaveCreditConfiguration'
} as const

export type LeaveCreditConfigurationApiKeys = keyof typeof LeaveCreditConfigurationApi





