export const OutDoorApi={
     PULL:"/Outdoor/PullOutdoor",
     ADD_UPDATE:"/Outdoor/AddUpdateOutdoor",
     DELETE:"/Outdoor/DeleteOutdoor",
     PUNCH_IN:"/Outdoor/AddOutdoorAttendance",
     ADD_UPDATE_CONCLUSION:"/Outdoor/AddUpdateConclusion",
} as const
export type OutDoorApiKeys = keyof typeof OutDoorApi
