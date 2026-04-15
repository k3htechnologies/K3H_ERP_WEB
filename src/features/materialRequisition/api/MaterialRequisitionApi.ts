export const MaterialRequisitionApi = {
    PULL : "/MaterialRequisition/PullMaterialRequisition",
    ADD_UPDATE : "/MaterialRequisition/AddUpdateMaterialRequisition",
    DELETE: "/MaterialRequisition/DeleteMaterialRequisition",
    CLOSE_REQUISITION: "/MaterialRequisition/CloseMaterialRequisition"
} as const

export type MaterialRequisitionApiKeys = keyof typeof MaterialRequisitionApi
