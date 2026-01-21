import type { AddUpdateEarningMasterRequest } from '@/features/earningMaster/models/EarningMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateEarningMasterRequest = {
  EarningMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  Name: "",
  Applicable: "",
  Type: "",
  Value: 0,
  MinSalary: 0,
  MaxSalary: 0,
  BranchMasterId: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['Name', 'Actions'];

export const getInitialFormState = (): AddUpdateEarningMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getEarningMasterColumns = (): TableColumn[] => [
  {
    key: 'Name',
    label: 'Earning Name',
    width: '15',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'Type',
    label: 'Type',
    width: '15',
    sortable: false,
    align: 'left'
  },
  {
    key: 'Applicable',
    label: 'Applicable',
    width: '15',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Value',
    label: 'Value',
    width: '15',
    sortable: false,
    align: 'center'
  },
  {
    key: 'MinSalary',
    label: 'Min Salary (₹)',
    width: '12',
    sortable: false,
    align: 'left'
  },
  {
    key: 'MaxSalary',
    label: 'Max Salary (₹)',
    width: '12',
    sortable: false,
    align: 'left'
  },
  {
    key: 'BranchName',
    label: 'Branch Name',
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
