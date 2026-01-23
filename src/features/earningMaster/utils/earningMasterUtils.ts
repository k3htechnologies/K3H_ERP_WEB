import type { AddUpdateEarningMasterRequest } from '@/features/earningMaster/models/EarningMasterModel';
import { INITIAL_FORM_STATE } from '@/features/earningMaster/constants/earningMasterConstants';

export const resetFormData = (): AddUpdateEarningMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingEarningMasterData: (value: any) => void,
  setFormData: (value: AddUpdateEarningMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { branchName?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void,
  setApplicable: (value: string) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingEarningMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
    setApplicable("Percenatge");
  };
};
