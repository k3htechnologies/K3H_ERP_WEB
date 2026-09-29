export const MeetingApi = {
    PULL: '/Meeting/PullMeetingMaster',
    PULL_PARTICIPANTS: '/Meeting/PullMeetingParticipants',
    ADD_UPDATE: '/Meeting/AddUpdateMeetingMaster',
    DELETE: '/Meeting/DeleteMeetingMaster',
} as const

export type MeetingApiKeys = keyof typeof MeetingApi
