export const EventApi = {
    PULL: '/Events/PullEvent',
    ADD_UPDATE: '/Events/AddUpdateEvent',
    DELETE: '/Events/DeleteEvent',
} as const

export type EventApiKeys = keyof typeof EventApi
