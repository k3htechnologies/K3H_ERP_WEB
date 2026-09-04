import type { AddUpdateGatePassRequest } from '@/features/gatePass/models/GatePassModel';
import { INITIAL_FORM_STATE } from '@/features/gatePass/constants/gatePassConstants';

export const resetFormData = (): AddUpdateGatePassRequest => ({
    ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingGatePassData: (value: any) => void,
    setFormData: (value: AddUpdateGatePassRequest) => void,
    setErrors: (value: { [k: string]: string }) => void,
    setPhotoFiles: (value: (File | string)[]) => void,
    setPhotoURL: (value: string | undefined) => void,
    setRemovedPhotoUrls: (value: string[]) => void
) => {
    return () => {

        setIsAddUpdateModalOpen(false);

        setEditingGatePassData(null);

        setFormData(resetFormData());

        setErrors({});

        setPhotoFiles([]);
        setPhotoURL("");
        setRemovedPhotoUrls([]);
    };
};
