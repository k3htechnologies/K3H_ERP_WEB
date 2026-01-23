import type { AddUpdateShiftMappingMasterRequest } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateShiftMappingMasterRequest = {
  ShiftManagementMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ShiftManagementMasterId: 0,
  DepartmentMasterId: "",
  EmployeeId: ""
};

export const REQUIRED_COLUMN_KEYS: string[] = ['ShiftName', 'Actions'];

export const getInitialFormState = (): AddUpdateShiftMappingMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getShiftMappingMasterColumns = (): TableColumn[] => [
  {
    key: 'ShiftName',
    label: 'Shift Name',
    width: '20',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'DepartmentName',
    label: 'Department Name',
    width: '20',
    sortable: false,
    align: 'left'
  },
  {
    key: 'EmployeeName',
    label: 'Employee Name',
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
