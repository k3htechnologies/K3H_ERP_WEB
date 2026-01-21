import type { AddUpdateLeaveTypeMasterRequest } from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateLeaveTypeMasterRequest = {
  LeaveTypeMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  LeaveType: "",
  LeaveTypeCode: "",
  IsCarryForward: false,
  MaxCarryForward: 0,
  IsEncashable: false,
};

export const REQUIRED_COLUMN_KEYS: string[] = ['LeaveType', 'Actions'];

export const getInitialFormState = (): AddUpdateLeaveTypeMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getLeaveTypeMasterColumns = (): TableColumn[] => [
  {
    key: 'LeaveType',
    label: 'Leave Type',
    width: '20',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'LeaveTypeCode',
    label: 'Leave Type Code',
    width: '20',
    sortable: false,
    align: 'left'
  },
  {
    key: 'IsCarryForward',
    label: 'Carry Forward',
    width: '15',
    sortable: false,
    align: 'center'
  },
  {
    key: 'MaxCarryForward',
    label: 'Max Carry Forward',
    width: '15',
    sortable: false,
    align: 'center'
  },
  {
    key: 'IsEncashable',
    label: 'Encashable',
    width: '15',
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
