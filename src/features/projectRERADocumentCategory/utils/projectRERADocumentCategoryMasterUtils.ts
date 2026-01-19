import type { AddUpdateProjectRERADocumentCategoryMasterRequest } from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';
import { INITIAL_FORM_STATE } from '@/features/projectRERADocumentCategory/constants/projectRERADocumentCategoryMasterConstants';

export const resetFormData = (): AddUpdateProjectRERADocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingProjectRERADocumentCategoryMasterData: (value: any) => void,
  setFormData: (value: AddUpdateProjectRERADocumentCategoryMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingProjectRERADocumentCategoryMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};

