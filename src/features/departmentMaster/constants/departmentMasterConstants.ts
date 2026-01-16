import type { AddUpdateDepartmentMasterRequest } from '@/features/departmentMaster/models/DepartmentMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateDepartmentMasterRequest = {
  DepartmentMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DepartmentCode: '',
  DepartmentName: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['DepartmentName','Actions'];

export const getInitialFormState = (): AddUpdateDepartmentMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getDepartmentMasterColumns = (): TableColumn[] => [
  {
    key: 'DepartmentName',
    label: 'Department Name',
    width: '33',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'DepartmentCode',
    label: 'Department Code',
    width: '30',
    sortable: false,
    align: 'center'
  },
  {
    key: 'NumberOfEmployee',
    label: 'Employee Count',
    width: '20',
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
