export const ContractRequisitionApi = {
  PULL: "/ContractRequisition/PullContractRequisition",
  PULL_OVERVIEW: "/ContractRequisition/PullContractRequisitionOverView",
  PULL_BUDGET_WITH_QUANTITY : "/ContractRequisition/PullBudgetWithQuantity",
  PULL_LOCK_AND_KEY_STATUS: "/ContractRequisition/PullProjectLockAndKeyContractStatus",
  ADD_UPDATE: "/ContractRequisition/AddUpdateContractRequisition",
  DELETE: "/ContractRequisition/DeleteContractRequisition",
  CLOSE_REQUISITION: "/ContractRequisition/CloseContractRequisition",
} as const;

export type ContractRequisitionApiKeys = keyof typeof ContractRequisitionApi;