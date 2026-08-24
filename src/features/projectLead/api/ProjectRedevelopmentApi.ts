export const ProjectRedevelopmentApi = {

    PULL_PROJECT_REDEVELOPMENT: "ProjectLead/PullProjectRedevelopment",
    ADD_UPDATE_PROJECT_REDEVELOPMENT: "ProjectLead/AddUpdateProjectRedevelopment",
    DELETE_PROJECT_REDEVELOPMENT: "ProjectLead/DeleteProjectRedevelopment",

} as const;

export type ProjectRedevelopmentApiKeys = keyof typeof ProjectRedevelopmentApi;
