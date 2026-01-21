import type { AddUpdateApprovalDocumentCategoryMasterRequest } from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';
import { INITIAL_FORM_STATE } from '@/features/approvalDocumentCategory/constants/approvalDocumentCategoryMasterConstants';

export const resetFormData = (): AddUpdateApprovalDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingApprovalDocumentCategoryMasterData: (value: any) => void,
  setFormData: (value: AddUpdateApprovalDocumentCategoryMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingApprovalDocumentCategoryMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};

