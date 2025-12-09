export const OutDoorApi={
     PULL:"/Outdoor/PullOutdoor",
     ADD_UPDATE:"/Outdoor/AddUpdateOutdoor",
     DELETE:"/Outdoor/DeleteOutdoor",
} as const
export type OutDoorApiKeys = keyof typeof OutDoorApi
