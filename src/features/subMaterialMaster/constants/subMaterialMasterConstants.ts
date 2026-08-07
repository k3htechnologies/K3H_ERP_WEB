import type { AddUpdateSubMaterialMasterRequest } from '@/features/subMaterialMaster/models/SubMaterialMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateSubMaterialMasterRequest = {
  SubMaterialMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MaterialMasterId: 0,
  SubMaterialName: '',
  UomMasterId: 0,
  LeadTimeInDays: 0,
  IsTolerant: false,
};

export const REQUIRED_COLUMN_KEYS: string[] = ['SubMaterialName', 'Actions'];

export const getInitialFormState = (): AddUpdateSubMaterialMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getSubMaterialMasterColumns = (): TableColumn[] => [
  {
    key: 'SubMaterialName',
    label: 'Sub Material Name',
    width: '20',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'MaterialName',
    label: 'Material Name',
    width: '30',
    sortable: false,
    align: 'left'
  },
  {
    key: 'Uom',
    label: 'UOM',
    width: '30',
    sortable: false,
    align: 'left'
  },
  {
    key: 'LeadTimeInDays',
    label: 'Lead Time (Days)',
    width: '20',
    sortable: false,
    align: 'left'
  },
  {
    key: 'IsTolerant',
    label: 'Is Tolerant',
    width: '20',
    sortable: false,
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
