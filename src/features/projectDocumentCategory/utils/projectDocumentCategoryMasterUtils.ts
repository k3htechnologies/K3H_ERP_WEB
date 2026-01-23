import type { AddUpdateProjectDocumentCategoryMasterRequest } from '@/features/projectDocumentCategory/models/ProjectDocumentCategoryMasterModel';
import { INITIAL_FORM_STATE } from '@/features/projectDocumentCategory/constants/projectDocumentCategoryMasterConstants';

export const resetFormData = (): AddUpdateProjectDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingProjectDocumentCategoryMasterData: (value: any) => void,
  setFormData: (value: AddUpdateProjectDocumentCategoryMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingProjectDocumentCategoryMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};

