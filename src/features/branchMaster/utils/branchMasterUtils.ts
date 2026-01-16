import type { AddUpdateBranchMasterRequest } from '@/features/branchMaster/models/BranchMasterModel';
import { INITIAL_FORM_STATE } from '@/features/branchMaster/constants/branchMasterConstants';

export const resetFormData = (): AddUpdateBranchMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingBranchMasterData: (value: any) => void,
  setFormData: (value: AddUpdateBranchMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingBranchMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};
