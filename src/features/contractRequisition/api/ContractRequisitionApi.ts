export const ContractRequisitionApi = {
  PULL: "/ContractRequisition/PullContractRequisition",
  PULL_LOCK_AND_KEY_STATUS: "/ContractRequisition/PullProjectLockAndKeyContractStatus",
  ADD_UPDATE: "/ContractRequisition/AddUpdateContractRequisition",
  DELETE: "/ContractRequisition/DeleteContractRequisition",
  CLOSE_REQUISITION: "/ContractRequisition/CloseContractRequisition",
} as const;

export type ContractRequisitionApiKeys = keyof typeof ContractRequisitionApi;