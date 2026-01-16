import type { AddUpdateShiftMappingMasterRequest } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import { INITIAL_FORM_STATE } from '@/features/shiftMappingMaster/constants/shiftMappingMasterConstants';

export const resetFormData = (): AddUpdateShiftMappingMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingShiftMappingMasterData: (value: any) => void,
  setFormData: (value: AddUpdateShiftMappingMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { departmentName?: string; EmployeeName?: string; shiftName?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void,
  setApplicableType: (value: string) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingShiftMappingMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
    setApplicableType('Department');
  };
};
