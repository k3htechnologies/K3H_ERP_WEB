import type { AddUpdateGatePassRequest } from '@/features/gatePass/models/GatePassModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateGatePassRequest = {
    ExternalId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    FullName: '',
    MobileNumber: '',
    Address: '',
    Purpose: '',
    Remark: '',
    EmployeeId: 0,
    PassDateTime: '',
    NoOfParticipants: 0,
};

export const REQUIRED_COLUMN_KEYS: string[] = ['FullName', 'Address', 'Purpose', 'Actions'];

export const getInitialFormState = (): AddUpdateGatePassRequest => ({
    ...INITIAL_FORM_STATE
});

export const getGatePassTableColumns = (): TableColumn[] => [
    {
        key: 'FullName',
        label: 'Visitor Name',
        width: '30',
        sortable: true,
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '30',
        sortable: false,
        align: 'left'
    },
    {
        key: 'Address',
        label: 'Address',
        width: '30',
        sortable: false,
        align: 'left'
    },
    {
        key: 'Purpose',
        label: 'Purpose',
        width: '30',
        sortable: true,
        align: 'left'
    },
    {
        key: 'Remark',
        label: 'Remark',
        width: '30',
        sortable: false,
        align: 'left'
    },
    {
        key: 'EmployeeName',
        label: 'Appointment With',
        width: '30',
        sortable: false,
        align: 'left'
    },
    {
        key: 'PassDateTime',
        label: 'Appointment Date',
        width: '30',
        sortable: false,
        align: 'left'
    },
    
    {
        key: 'Actions',
        label: 'Actions',
        width: '30',
        fixed: 'right',
        align: 'center'
    },
];