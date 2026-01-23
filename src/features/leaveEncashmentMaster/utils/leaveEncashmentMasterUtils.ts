import type { AddUpdateLeaveEncashmentMasterRequest } from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';
import { INITIAL_FORM_STATE } from '@/features/leaveEncashmentMaster/constants/leaveEncashmentMasterConstants';

export const resetFormData = (): AddUpdateLeaveEncashmentMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingLeaveEncashmentMasterData: (value: any) => void,
  setFormData: (value: AddUpdateLeaveEncashmentMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingLeaveEncashmentMasterData(null);
    setFormData(resetFormData());
    setErrors({});
  };
};
