import type { AddUpdateSubMaterialMasterRequest } from '@/features/subMaterialMaster/models/SubMaterialMasterModel';
import { INITIAL_FORM_STATE } from '@/features/subMaterialMaster/constants/subMaterialMasterConstants';

export const resetFormData = (): AddUpdateSubMaterialMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingSubMaterialMasterData: (value: any) => void,
  setFormData: (value: AddUpdateSubMaterialMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { materialName?: string; uom?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingSubMaterialMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
  };
};
