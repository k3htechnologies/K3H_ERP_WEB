import type { AddUpdatePaymentScheduleSchemeMasterRequest } from '@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdatePaymentScheduleSchemeMasterRequest = {
    PaymentScheduleSchemeMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    InventoryBuildingId: 0,
    PaymentScheduleScheme: '',
    OrderBy: 0,
    InventoryFlatFloorBasementPodiumWingId: 0,
    Wing: ''
};


export const getInitialFormState = (): AddUpdatePaymentScheduleSchemeMasterRequest => ({
    ...INITIAL_FORM_STATE
});

export const getPaymentScheduleSchemeMasterColumns = (): TableColumn[] => [
    {
        key: 'PaymentScheduleScheme',
        label: 'Scheme',
        width: '30',
        sortable: true,
        fixed: 'left',
        align: 'left'
    },
    {
        key: 'BuildingNumber',
        label: 'Building',
        width: '30',
        sortable: false,
        align: 'center'
    },
    {
        key: 'Wing',
        label: 'Wing',
        width: '30',
        sortable: false,
        align: 'center'
    },
    {
        key: 'Actions',
        label: 'Actions',
        width: '30',
        fixed: 'right',
        align: 'center'
    }
];

export const REQUIRED_COLUMN_KEYS: string[] = ['PaymentScheduleScheme', 'Actions'];
