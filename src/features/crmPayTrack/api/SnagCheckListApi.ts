export const SnagCheckListApi = {

    PULL: '/SnagCheckList/PullSnagCheckList',
    ADD_UPDATE: "/SnagCheckList/AddUpdateSnagCheckList"

} as const

export type SnagCheckListApiKeys = keyof typeof SnagCheckListApi