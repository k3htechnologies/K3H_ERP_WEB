import type { AddUpdateTestDocumentCategoryMasterRequest } from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateTestDocumentCategoryMasterRequest = {
  TestDocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  TestDocumentCategory: '',
  OrderBy: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['TestDocumentCategoryName', 'Actions'];

export const getInitialFormState = (): AddUpdateTestDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getTestDocumentCategoryMasterColumns = (): TableColumn[] => [
  {
    key: 'TestDocumentCategoryName',
    label: 'Test Document Category',
    width: '60',
    sortable: true,
    fixed: 'left',
    align: 'left'
  },
  {
    key: 'OrderBy',
    label: 'Sequence',
    width: '60',
    sortable: true,
    align: 'center'
  },
  {
    key: 'DocumentCount',
    label: 'Document Count',
    width: '60',
    sortable: false,
    align: 'center'
  },
  {
    key: 'Actions',
    label: 'Actions',
    width: '60',
    fixed: 'right',
    align: 'center'
  }
];

