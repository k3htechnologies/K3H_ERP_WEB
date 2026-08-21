import type { AddUpdateDrawingDocumentCategoryMasterRequest } from '@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateDrawingDocumentCategoryMasterRequest = {
  DrawingDocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  DrawingDocumentCategory: '',
  OrderBy: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['DrawingDocumentCategoryName', 'Actions'];

export const getInitialFormState = (): AddUpdateDrawingDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getDrawingDocumentCategoryMasterColumns = (): TableColumn[] => [
  {
    key: 'DrawingDocumentCategoryName',
    label: 'Drawing Document Category',
    width: '60',
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
  },
  {
    key: 'Actions',
    label: 'Actions',
    width: '12',
    fixed: 'right',
    align: 'center'
  }
];

