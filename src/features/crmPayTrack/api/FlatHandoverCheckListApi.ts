export const FlatHandoverCheckListApi = {

    PULL: 'FlatHandoverCheckList/PullFlatHandoverCheckList',
    ADD_UPDATE: 'FlatHandoverCheckList/AddUpdateFlatHandoverCheckList'
    
} as const

export type FlatHandoverCheckListApiKeys = keyof typeof FlatHandoverCheckListApi