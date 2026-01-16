import type { AddUpdateBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { INITIAL_FORM_STATE } from '@/features/branchAssociationsMaster/constants/branchAssociationsMasterConstants';

export const resetFormData = (): AddUpdateBranchAssociationsMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingBranchAssociationMasterData: (value: any) => void,
  setFormData: (value: AddUpdateBranchAssociationsMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { branchName?: string; employeeName?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingBranchAssociationMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
  };
};
