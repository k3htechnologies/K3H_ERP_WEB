import { INITIAL_FORM_STATE } from "@/features/contractMaster/constants/contractMasterConstants";
import type { AddUpdateSpecificationMaster } from "@/features/specificationMaster/models/SpecificationMasterModel";

export const resetFormData = (): AddUpdateSpecificationMaster => ({
    ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingContractMasterData: (value: any) => void,
    setFormData: (value: AddUpdateSpecificationMaster) => void,
    setErrors: (value: { [k: string]: string }) => void
) => {
    return () => {
        setIsAddUpdateModalOpen(false);
        setEditingContractMasterData(null);
        setFormData(resetFormData());
        setErrors({});
    };
};
