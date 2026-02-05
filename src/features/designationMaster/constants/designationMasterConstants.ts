import type { AddUpdateDesignationMasterRequest } from '@/features/designationMaster/models/DesignationMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateDesignationMasterRequest = {
  DesignationMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DesignationName: '',
  NoticePeriod: 0,
  ProbationPeriod: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['DesignationName', 'Actions'];

export const getInitialFormState = (): AddUpdateDesignationMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getDesignationMasterColumns = (): TableColumn[] => [
  {
    key: 'DesignationName',
    label: 'Designation Name',
    width: '33',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'NoticePeriod',
    label: 'Notice Period',
    width: '30',
    sortable: false,
    align: 'center'
  },
  {
    key: 'ProbationPeriod',
    label: 'Probation Period',
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
