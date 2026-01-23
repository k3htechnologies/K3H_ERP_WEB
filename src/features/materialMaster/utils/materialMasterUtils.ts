import type { AddUpdateMaterialMasterRequest } from '@/features/materialMaster/models/MaterialMasterModel';
import { INITIAL_FORM_STATE } from '@/features/materialMaster/constants/materialMasterConstants';

export const resetFormData = (): AddUpdateMaterialMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingMaterialMasterData: (value: any) => void,
  setFormData: (value: AddUpdateMaterialMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingMaterialMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};
