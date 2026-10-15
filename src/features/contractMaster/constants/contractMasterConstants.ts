import type { TableColumn } from '@/ui/components/DataTable/DataTable';
import type { AddUpdateContractMasterRequest } from '@/features/contractMaster/models/ContractMasterModel';

export const INITIAL_FORM_STATE: AddUpdateContractMasterRequest = {
    ContractMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ContractCode: '',
    ContractName: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['ContractName', 'Actions'];

export const getInitialFormState = (): AddUpdateContractMasterRequest => ({
    ...INITIAL_FORM_STATE
});

export const getContractMasterColumns = (): TableColumn[] => [
    {
        key: 'ContractName',
        label: 'Contract Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'ContractCode',
        label: 'Contract Code',
        width: '30',
        sortable: false,
        align: 'center'
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center'
    }
];
