import type { AddUpdateHolidayMasterRequest } from '@/features/holidayMaster/models/HolidayMasterModel';
import { INITIAL_FORM_STATE } from '@/features/holidayMaster/constants/holidayMasterConstants';

export const resetFormData = (): AddUpdateHolidayMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingHolidayMasterData: (value: any) => void,
  setFormData: (value: AddUpdateHolidayMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setHolidayFiles: (value: (File | string)[]) => void,
  setHolidayURL: (value: string | undefined) => void,
  setRemovedHolidayUrls: (value: string[]) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingHolidayMasterData(null);
    setFormData(resetFormData());
    setErrors({});
    setHolidayFiles([]);
    setHolidayURL("");
    setRemovedHolidayUrls([]);
  };
};
