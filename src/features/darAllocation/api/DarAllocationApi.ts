export const DarAllocationApi = {

    PULL: '/DarAllocation/PullDarAllocation',
    ADD_UPDATE: '/DarAllocation/AddUpdateDarAllocation',
    DELETE: '/DarAllocation/DeleteDarAllocation'

} as const

export type DarAllocationApiKeys = keyof typeof DarAllocationApi


