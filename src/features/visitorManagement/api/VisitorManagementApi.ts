export const VisitorManagementApi = {
    PULL: "/VisitorManagement/PullVisitorManagement",
    ADD_UPDATE: "/VisitorManagement/AddUpdateVisitorManagement",
    DELETE: "/VisitorManagement/DeleteVisitorManagement",
    PULL_VISITOR_BY_MOBILE_NO: '/VisitorManagement/PullVisitorByMobileNo'
} as const

export type VisitorManagementApiKeys = keyof typeof VisitorManagementApi