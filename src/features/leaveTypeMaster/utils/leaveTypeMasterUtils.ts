import type { AddUpdateLeaveTypeMasterRequest } from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';
import { INITIAL_FORM_STATE } from '@/features/leaveTypeMaster/constants/leaveTypeMasterConstants';

export const resetFormData = (): AddUpdateLeaveTypeMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingLeaveTypeMasterData: (value: any) => void,
  setFormData: (value: AddUpdateLeaveTypeMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setPrevMaxCarryForward: (value: number) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingLeaveTypeMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setPrevMaxCarryForward(0);
  };
};
