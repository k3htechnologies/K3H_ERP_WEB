export const AgendaApi = {
    PULL: '/Agenda/PullAgenda',
    ADD_UPDATE: '/Agenda/AddUpdateAgenda',
    DELETE: '/Agenda/DeleteAgenda',
    PULL_PREVIOUS: '/Agenda/PullPreviousAgendaDetails',
    ADD_AGENDA_TASK: '/Agenda/AddAgendaTask',
} as const

export type AgendaApiKeys = keyof typeof AgendaApi
