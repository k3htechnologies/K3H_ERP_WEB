export const ProjectLandApi = {
    
    PULL_PROJECT_LAND: "ProjectLead/PullProjectLand",
    ADD_UPDATE_PROJECT_LAND: "ProjectLead/AddUpdateProjectLand",
    DELETE_PROJECT_LAND: "ProjectLead/DeleteProjectLand",

} as const;

export type ProjectLandApiKeys = keyof typeof ProjectLandApi;