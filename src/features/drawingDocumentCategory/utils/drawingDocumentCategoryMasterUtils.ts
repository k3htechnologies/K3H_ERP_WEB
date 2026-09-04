import type { AddUpdateDrawingDocumentCategoryMasterRequest } from '@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel';
import { INITIAL_FORM_STATE } from '@/features/drawingDocumentCategory/constants/drawingDocumentCategoryMasterConstants';

export const resetFormData = (): AddUpdateDrawingDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingDrawingDocumentCategoryMasterData: (value: any) => void,
  setFormData: (value: AddUpdateDrawingDocumentCategoryMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingDrawingDocumentCategoryMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};

