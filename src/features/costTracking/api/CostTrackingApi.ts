export const CostTrackingApi = {

    PULL: "CostTracking/PullCostTracking",
    ADD_UPDATE: "CostTracking/AddUpdateCostTracking",

} as const
export type CostTrackingApiKeys = keyof typeof CostTrackingApi;