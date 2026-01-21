import type { AddUpdateBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateBranchAssociationsMasterRequest = {
  BranchAssociationsId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  BranchMasterId: "",
  EmployeeId: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['EmployeeName', 'Actions'];

export const getInitialFormState = (): AddUpdateBranchAssociationsMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getBranchAssociationsMasterColumns = (): TableColumn[] => [
  {
    key: 'EmployeeName',
    label: 'Employee Name',
    width: '25',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'BranchName',
    label: 'Branch Name',
    width: '25',
    sortable: true,
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
