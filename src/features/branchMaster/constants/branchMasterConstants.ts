import type { AddUpdateBranchMasterRequest } from '@/features/branchMaster/models/BranchMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateBranchMasterRequest = {
  BranchMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BranchCode: '',
  BranchName: '',
  IsHeadOffice: false,
  Location: ''
};

export const REQUIRED_COLUMN_KEYS: string[] = ['BranchName', 'Actions'];

export const getInitialFormState = (): AddUpdateBranchMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getBranchMasterColumns = (): TableColumn[] => [
  {
    key: 'BranchName',
    label: 'Branch Name',
    width: '25',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'BranchCode',
    label: 'Branch Code',
    width: '20',
    sortable: false,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'IsHeadOffice',
    label: 'Head Office',
    width: '15',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Location',
    label: 'Location',
    width: '25',
    sortable: false,
    align: 'left'
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
