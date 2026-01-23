import type { AddUpdateUomMasterRequest } from '@/features/uomMaster/models/UOMMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateUomMasterRequest = {
  UomMasterId: 0,
  Uniquekey: null,
  UomCode: '',
  UomName: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['Uom'];

export const getInitialFormState = (): AddUpdateUomMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getUomMasterColumns = (): TableColumn[] => [
  {
    key: 'Uom',
    label: 'UOM',
    width: '33',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'UomCode',
    label: 'UOM Code',
    width: '30',
    sortable: false,
    align: 'center'
  }
];
