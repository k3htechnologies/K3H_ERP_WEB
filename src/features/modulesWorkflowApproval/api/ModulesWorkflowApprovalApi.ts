export const ModulesWorkflowApprovalApi = {

    PULL: '/modulesWorkflowApproval/PullModulesWorkflowApproval',
    ADD_UPDATE: '/ModulesWorkflowApproval/AddUpdateModulesWorkflowApproval',
    DELETE: '/ModulesWorkflowApproval/DeleteModulesWorkflowApproval',
    UPDATE_MODULES_WORKFLOW: '/ModulesWorkflowApproval/UpdateModulesWorkflowApproval',
    PULL_SUMMARY: '/ModulesWorkflowApproval/PullModulesWorkflowApprovalSummary',
    PULL_MODULE_APPROVAL_STATUS: '/ModulesWorkflowApproval/PullModuleApprovalStatus',

} as const

export type ModulesWorkflowApprovalApiKeys = keyof typeof ModulesWorkflowApprovalApi