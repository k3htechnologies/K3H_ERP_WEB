export const MeetingApi = {
    PULL: '/Meeting/PullMeetingMaster',
    ADD_UPDATE: '/Meeting/AddUpdateMeetingMaster',
    DELETE: '/Meeting/DeleteMeetingMaster',
    PULL_MOM: '/MOM/PullMOM',
    ADD_UPDATE_MOM: '/MOM/AddUpdateMOMDocuments',
    DELETE_MOM: '/MOM/DeleteMOM',
    PULL_AGENDA: '/Agenda/PullAgenda',
    ADD_UPDATE_AGENDA: '/Agenda/AddUpdateAgenda',
    DELETE_AGENDA: '/Agenda/DeleteAgenda',
    PULL_PREVIOUS_AGENDA: '/Agenda/PullPreviousAgendaDetails',
} as const

export type MeetingApiKeys = keyof typeof MeetingApi
