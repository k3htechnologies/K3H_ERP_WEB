import type { AddUpdateCompOff } from '@/features/compOff/models/compOff';
import { INITIAL_FORM_STATE } from '@/features/compOff/constants/compOffConstants';

export const resetFormData = (): AddUpdateCompOff => ({
  ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingCompOffData: (value: any) => void,
  setFormData: (value: AddUpdateCompOff) => void,
  setErrors: (value: { [k: string]: string }) => void,
  setModalKey: (value: number | ((prev: number) => number)) => void
) => {
  return () => {
    setIsAddUpdateModalOpen(false);
    setEditingCompOffData(null);
    setFormData(resetFormData());
    setErrors({});
    setModalKey((prev) => prev + 1);
  };
};
