import type { AddUpdateDesignationMasterRequest } from '@/features/designationMaster/models/DesignationMasterModel';
import { INITIAL_FORM_STATE } from '@/features/designationMaster/constants/designationMasterConstants';

export const resetFormData = (): AddUpdateDesignationMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingDesignationMasterData: (value: any) => void,
  setFormData: (value: AddUpdateDesignationMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingDesignationMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};
