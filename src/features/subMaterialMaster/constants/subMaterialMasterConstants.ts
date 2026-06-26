import type { AddUpdateSubMaterialMasterRequest } from '@/features/subMaterialMaster/models/SubMaterialMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateSubMaterialMasterRequest = {
  SubMaterialMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MaterialMasterId: 0,
  SubMaterialName: '',
  UomMasterId: 0
  ,
  IsTolerant: false
};

export const REQUIRED_COLUMN_KEYS: string[] = ['SubMaterialName', 'Actions'];

export const getInitialFormState = (): AddUpdateSubMaterialMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getSubMaterialMasterColumns = (): TableColumn[] => [
  {
    key: 'SubMaterialName',
    label: 'Sub Material Name',
    width: '33',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'MaterialName',
    label: 'Material Name',
    width: '30',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Uom',
    label: 'UOM',
    width: '20',
    sortable: false,
    align: 'center'
  },
  {
    key: 'IsTolerant',
    label: 'Tolerance',
    width: '10',
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
