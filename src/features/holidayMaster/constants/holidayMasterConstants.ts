import type { AddUpdateHolidayMasterRequest } from '@/features/holidayMaster/models/HolidayMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateHolidayMasterRequest = {
  HolidayMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  HolidayName: "",
  HolidayURL: null,
  RemoveHolidayURL: "",
};

export const REQUIRED_COLUMN_KEYS: string[] = ['HolidayName', 'Actions'];

export const getInitialFormState = (): AddUpdateHolidayMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getHolidayMasterColumns = (): TableColumn[] => [
  {
    key: 'HolidayName',
    label: 'Holiday Name',
    width: '25',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'HolidayURL',
    label: 'Holiday Document',
    width: '25',
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
