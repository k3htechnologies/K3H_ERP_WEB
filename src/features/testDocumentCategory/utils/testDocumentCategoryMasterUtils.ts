import type { AddUpdateTestDocumentCategoryMasterRequest } from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';
import { INITIAL_FORM_STATE } from '@/features/testDocumentCategory/constants/testDocumentCategoryMasterConstants';

export const resetFormData = (): AddUpdateTestDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingTestDocumentCategoryMasterData: (value: any) => void,
  setFormData: (value: AddUpdateTestDocumentCategoryMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingTestDocumentCategoryMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};

