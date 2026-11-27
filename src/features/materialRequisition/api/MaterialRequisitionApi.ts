export const MaterialRequisitionApi = {

    PULL : "/MaterialRequisition/PullMaterialRequisition",
    PULL_MATERIAL_REQUISITION_OVERVIEW : "/MaterialRequisition/PullMaterialRequisitionOverview",
    PULL_MATERIAL_REQUISITION_DETAILS : "/MaterialRequisition/PullMaterialRequisitionDetails",
    ADD_UPDATE : "/MaterialRequisition/AddUpdateMaterialRequisition",
    DELETE: "/MaterialRequisition/DeleteMaterialRequisition",
    CLOSE_REQUISITION: "/MaterialRequisition/CloseMaterialRequisition",
    PULL_MATERIAL_REQUISITION_STAGES_SUMMARY:"/MaterialRequisition/PullMaterialRequisitionStagesSummary"
    
} as const

export type MaterialRequisitionApiKeys = keyof typeof MaterialRequisitionApi