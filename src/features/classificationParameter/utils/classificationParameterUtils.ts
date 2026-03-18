import type { AddUpdateClassificationParameterRequest } from '@/features/classificationParameter/models/ClassificationParameterModel';
import { INITIAL_FORM_STATE } from '@/features/classificationParameter/constants/classificationParameterConstants';

export const resetFormData = (): AddUpdateClassificationParameterRequest => ({
    ...INITIAL_FORM_STATE
});


export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingClassificationParameterData: (value: any) => void,
    setFormData: (value: AddUpdateClassificationParameterRequest) => void,
    setErrors: (value: { [k: string]: string }) => void,
    setVillageValue: (value: any) => void
) => {
    return () => {

        setIsAddUpdateModalOpen(false);

        setEditingClassificationParameterData(null);

        setFormData(resetFormData());

        setErrors({});
        setVillageValue("");
    };
};
