import type { AddUpdateApprovalDocumentCategoryMasterRequest } from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';
import type { TableColumn } from '@/ui/components/DataTable/DataTable';

export const INITIAL_FORM_STATE: AddUpdateApprovalDocumentCategoryMasterRequest = {
  ApprovalDocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ApprovalDocumentCategory: '',
  OrderBy: 0
};

export const REQUIRED_COLUMN_KEYS: string[] = ['ApprovalDocumentCategoryName', 'Actions'];

export const getInitialFormState = (): AddUpdateApprovalDocumentCategoryMasterRequest => ({
  ...INITIAL_FORM_STATE
});

export const getApprovalDocumentCategoryMasterColumns = (): TableColumn[] => [
  {
    key: 'ApprovalDocumentCategoryName',
    label: 'Approval Document Category',
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
  },
  {
    key: 'Actions',
    label: 'Actions',
    width: '12',
    fixed: 'right',
    align: 'center'
  }
];

