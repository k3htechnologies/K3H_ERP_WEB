import type { AddUpdateHolidayMappingMasterRequest } from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';
import { INITIAL_FORM_STATE } from '@/features/holidayMappingMaster/constants/holidayMappingMasterConstants';

export const resetFormData = (): AddUpdateHolidayMappingMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingHolidayMappingMasterData: (value: any) => void,
  setFormData: (value: AddUpdateHolidayMappingMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setDropdownLabels: (value: { branchName?: string; holidayName?: string }) => void,
  setDropdownResetKey: (value: number | ((prev: number) => number)) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingHolidayMappingMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setDropdownLabels({});
    setDropdownResetKey(prev => prev + 1);
  };
};
