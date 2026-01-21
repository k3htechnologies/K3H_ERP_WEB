import type { AddUpdateMaterialMasterRequest } from '@/features/materialMaster/models/MaterialMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateMaterialMasterRequest = {
  MaterialMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MaterialCode: '',
  MaterialName: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['MaterialName', 'Actions'];

export const getInitialFormState = (): AddUpdateMaterialMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getMaterialMasterColumns = (): TableColumn[] => [
  {
    key: 'MaterialName',
    label: 'Material Name',
    width: '33',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'MaterialCode',
    label: 'Material Code',
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
