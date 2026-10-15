import { INITIAL_FORM_STATE } from "@/features/contractMaster/constants/contractMasterConstants";
import type { AddUpdateContractMasterRequest } from "@/features/contractMaster/models/ContractMasterModel";

export const resetFormData = (): AddUpdateContractMasterRequest => ({
    ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingContractMasterData: (value: any) => void,
    setFormData: (value: AddUpdateContractMasterRequest) => void,
    setErrors: (value: { [k: string]: string }) => void
) => {
    return () => {
        setIsAddUpdateModalOpen(false);
        setEditingContractMasterData(null);
        setFormData(resetFormData());
        setErrors({});
    };
};
