import type { AddUpdateUomMasterRequest } from '@/features/uomMaster/models/UOMMasterModel';
import { INITIAL_FORM_STATE } from '@/features/uomMaster/constants/uomMasterConstants';

export const resetFormData = (): AddUpdateUomMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingUomMasterData: (value: any) => void,
  setFormData: (value: AddUpdateUomMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingUomMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};
