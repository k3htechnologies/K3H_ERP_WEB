import type { AddUpdateOtherChargesRequest } from '@/features/otherCharges/models/OtherChargesModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateOtherChargesRequest = {
  OtherChargesId: 0,
  ProjectId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ChargeName: '',
  CalculatedOn: null,
  Value: 0,
  GSTPercentage: 0,
  GSTValue: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['ChargeName', 'Actions'];

export const getInitialFormState = (): AddUpdateOtherChargesRequest => ({
  ...INITIAL_FORM_STATE
});

export const getOtherChargesColumns = (): TableColumn[] => [
  {
    key: 'ChargeName',
    label: 'Charge Name',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Value',
    label: 'Value',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'CalculatedOn',
    label: 'Calculated On',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'GSTPercentage',
    label: 'GST Percentage',
    width: '16',
    sortable: false,
    align: 'center'
  },
  {
    key: 'GSTValue',
    label: 'GST Value',
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


