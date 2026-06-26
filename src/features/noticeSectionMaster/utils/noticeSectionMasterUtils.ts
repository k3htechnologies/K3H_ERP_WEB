import type { AddUpdateNoticeSectionMasterRequest } from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';
import { INITIAL_FORM_STATE } from '@/features/noticeSectionMaster/constants/noticeSectionMasterConstants';

export const resetFormData = (): AddUpdateNoticeSectionMasterRequest => ({
    ...INITIAL_FORM_STATE
});


export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingNoticeSectionMasterData: (value: any) => void,
    setFormData: (value: AddUpdateNoticeSectionMasterRequest) => void,
    setErrors: (value: { [k: string]: string }) => void
) => {
    return () => {

        setIsAddUpdateModalOpen(false);

        setEditingNoticeSectionMasterData(null);

        setFormData(resetFormData());

        setErrors({});
    };
};
