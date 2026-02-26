import type { AddUpdateLeaveEncashmentMasterRequest } from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateLeaveEncashmentMasterRequest = {
  LeaveEncashmentMasterSlabsId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  EarningMasterName: '',
  MinSalary: 0,
  MaxSalary: 0,
  EncashmentRate: 0,
};

export const REQUIRED_COLUMN_KEYS: string[] = ['EarningMasterName', 'Actions'];

export const getInitialFormState = (): AddUpdateLeaveEncashmentMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getLeaveEncashmentMasterColumns = (): TableColumn[] => [
  {
    key: 'EarningMasterName',
    label: 'Earning Name',
    width: '20',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'MinSalary',
    label: 'Min Salary (₹)',
    width: '20',
    sortable: false,
    align: 'center'
  },
  {
    key: 'MaxSalary',
    label: 'Max Salary (₹)',
    width: '20',
    sortable: false,
    align: 'center'
  },
  {
    key: 'EncashmentRate',
    label: 'Encashment Rate (%)',
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
