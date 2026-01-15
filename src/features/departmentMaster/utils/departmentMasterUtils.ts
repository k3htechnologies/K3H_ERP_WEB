import type { AddUpdateDepartmentMasterRequest } from '../models/DepartmentMasterModel';
import { INITIAL_FORM_STATE } from '../constants/departmentMasterConstants';

export const resetFormData = (): AddUpdateDepartmentMasterRequest => ({
  ...INITIAL_FORM_STATE
});


export const createFormResetHandler = (
  setIsAddUpdateModalOpen: (value: boolean) => void,
  setEditingDepartmentMasterData: (value: any) => void,
  setFormData: (value: AddUpdateDepartmentMasterRequest) => void,
  setErrors: (value: { [k: string]: string }) => void
) => {
  return () => {

    setIsAddUpdateModalOpen(false);

    setEditingDepartmentMasterData(null);

    setFormData(resetFormData());
    
    setErrors({});
  };
};
