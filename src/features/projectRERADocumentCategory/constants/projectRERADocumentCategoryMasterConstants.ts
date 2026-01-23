import type { AddUpdateProjectRERADocumentCategoryMasterRequest } from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateProjectRERADocumentCategoryMasterRequest = {
  ProjectRERADocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ProjectRERADocumentCategory: '',
  OrderBy: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['ProjectRERADocumentCategoryName'];

export const getInitialFormState = (): AddUpdateProjectRERADocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getProjectRERADocumentCategoryMasterColumns = (): TableColumn[] => [
  {
    key: 'ProjectRERADocumentCategoryName',
    label: 'RERA Document Category',
    width: '40',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'OrderBy',
    label: 'Sequence',
    width: '20',
    sortable: true,
    align: 'center'
  },
  {
    key: 'DocumentCount',
    label: 'Document Count',
    width: '20',
    sortable: false,
    align: 'center'
  }
];

