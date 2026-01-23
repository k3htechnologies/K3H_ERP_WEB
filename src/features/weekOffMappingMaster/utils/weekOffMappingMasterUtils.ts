import type { AddUpdateWeekOffMappingMasterRequest } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';
import { INITIAL_FORM_STATE } from '@/features/weekOffMappingMaster/constants/weekOffMappingMasterConstants';

export const resetFormData = (): AddUpdateWeekOffMappingMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingWeekOffMappingMasterData: (value: any) => void,
  setFormData: (value: AddUpdateWeekOffMappingMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { departmentName?: string; employeeName?: string; weekOffPolicyName?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void,
  setMappingWeekoff: (value: string) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingWeekOffMappingMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
    setMappingWeekoff('Department');
  };
};
