import type { TableColumn } from '@/ui/components/DataTable/DataTable';
import type { AddUpdateSpecificationMaster } from '@/features/specificationMaster/models/SpecificationMasterModel';

export const INITIAL_FORM_STATE: AddUpdateSpecificationMaster = {
    SpecificationMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    CategoryName: "",
    UomMasterId: 0,
    LevelId1: 0,
    LevelId2: 0,
    LevelId3: 0,
    SubMaterialMasterId: 0,
    Quantity: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['CategoryName', 'Actions'];

export const getInitialFormState = (): AddUpdateSpecificationMaster => ({
    ...INITIAL_FORM_STATE
});

export const getContractMasterColumns = (): TableColumn[] => [
    {
        key: 'CategoryName',
        label: 'Contract Name',
        width: '33',
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center'
    }
];
