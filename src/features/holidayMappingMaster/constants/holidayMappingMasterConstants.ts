import type { AddUpdateHolidayMappingMasterRequest } from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateHolidayMappingMasterRequest = {
  HolidayMappingMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  HolidayMasterId: 0,
  BranchMasterId: "",
  DepartmentMasterId: "",
  HolidayDate: ""
};

export const REQUIRED_COLUMN_KEYS: string[] = ['HolidayName', 'Actions'];

export const getInitialFormState = (): AddUpdateHolidayMappingMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getHolidayMappingMasterColumns = (): TableColumn[] => [
  {
    key: 'HolidayName',
    label: 'Holiday Name',
    width: '25',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'BranchName',
    label: 'Branch Name',
    width: '25',
    sortable: false,
    align: 'left'
  },
  {
    key: 'DepartmentName',
    label: 'Department Name',
    width: '25',
    sortable: false,
    align: 'left'
  },
  {
    key: 'HolidayDate',
    label: 'Holiday Date',
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
