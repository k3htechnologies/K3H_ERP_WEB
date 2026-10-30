import type { AddUpdateDarAllocationRequest } from '@/features/darAllocation/models/DarAllocationModel';
import { INITIAL_FORM_STATE } from '@/features/darAllocation/constants/darAllocationConstants';

export const resetFormData = (): AddUpdateDarAllocationRequest => ({
    ...INITIAL_FORM_STATE
});

export const createFormResetHandler = (
    setIsAddUpdateModalOpen: (value: boolean) => void,
    setEditingDarAllocationData: (value: any) => void,
    setFormData: (value: AddUpdateDarAllocationRequest) => void,
    setErrors: (value: { [k: string]: string }) => void,
    setVillageValue: (value: any) => void,
    setDropdownResetKey: (value: number | ((prev: number) => number)) => void
) => {
    return () => {

        setIsAddUpdateModalOpen(false);

        setEditingDarAllocationData(null);

        setFormData(resetFormData());

        setErrors({});

        setVillageValue(null);

        setDropdownResetKey(prev => prev + 1);
    };
};