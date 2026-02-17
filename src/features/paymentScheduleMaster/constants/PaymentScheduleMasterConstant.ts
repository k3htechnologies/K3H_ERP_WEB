import type { AddUpdatePaymentScheduleMasterRequest } from '@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdatePaymentScheduleMasterRequest = {
  PaymentScheduleMasterId: 0,
  ProjectId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  Date: '',
  Name:'',
  Percentage: 0,
  StageId: 0,
  Type:''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['Type', 'Actions'];

export const getInitialFormState = (): AddUpdatePaymentScheduleMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getPaymentScheduleMasterColumns = (): TableColumn[] => [
  {
    key: 'Type',
    label: 'Type',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Date',
    label: 'Date / Stage',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Percentage',
    label: 'Percentage',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Cumulative',
    label: 'Cumulative',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Amount',
    label: 'Amount',
    width: '16',
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


