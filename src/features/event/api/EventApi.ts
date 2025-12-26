export const EventsApi = {
    PULL: '/Events/PullEvent',
    ADD_UPDATE: '/Events/AddUpdateEvent',
    DELETE: '/Events/DeleteEvent'
} as const

export type EventsApiKeys = keyof typeof EventsApi