import type { AddUpdateDarAllocationRequest } from '@/features/darAllocation/models/DarAllocationModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateDarAllocationRequest = {
    DarAllocationId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    EmployeeId: 0,
    VillageMasterId: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['EmployeeList', 'VillageList', 'Actions'];

export const getInitialFormState = (): AddUpdateDarAllocationRequest => ({
    ...INITIAL_FORM_STATE
});

export const getDarAllocationColumns = (): TableColumn[] => [
    {
        key: 'EmployeeName',
        label: 'Employee Name',
        width: '15',
        sortable: true,
        align: 'left'
    },

    {
        key: 'VillageName',
        label: 'Village Name',
        width: '30',
        sortable: false,
        align: 'left'
    },
    
    {
        key: 'NumberOfChannelPartner',
        label: 'Number Of CP',
        width: '10',
        sortable: false,
        align: 'center'
    },
    
    {
        key: 'Actions',
        label: 'Actions',
        width: '10',
        fixed: 'right',
        align: 'center'
    }
]