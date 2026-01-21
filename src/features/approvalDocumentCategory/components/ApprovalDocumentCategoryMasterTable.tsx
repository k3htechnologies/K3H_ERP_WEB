import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { ApprovalDocumentCategoryMasterData } from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';

interface ApprovalDocumentCategoryMasterTableProps {
  data: ApprovalDocumentCategoryMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: ApprovalDocumentCategoryMasterData) => void;
  onDelete: (row: ApprovalDocumentCategoryMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const ApprovalDocumentCategoryMasterTable: React.FC<ApprovalDocumentCategoryMasterTableProps> = ({
  data,
  columns,
  pagination,
  sortInfo,
  onSort,
  onView,
  onDelete,
  canAction,
  loading
}) => {
  const tableColumns = useMemo<TableColumn[]>(() => {
    return columns.map(col => {
      if (col.key === 'Actions') {
        return {
          ...col,
          render: (_value, row: ApprovalDocumentCategoryMasterData) => (
            canAction && !(row as any).NumberOfEmployee ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(row)
                  }}
                  color='transparent'
                  isborderRadius
                  size='sm'
                  style={{
                    color: 'red',
                    padding: '4px 8px'
                  }}
                  title="Delete Approval Document Category"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }

      if (col.key === 'ApprovalDocumentCategoryName') {
        return {
          ...col,
          render: (value, row) => (
            <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
              <TooltipText
                text={value || '-'}
                maxWidth="500px"
                tooltipThreshold={30}
                onClick={() => onView(row)}
              />
            </div>
          )
        };
      }
      return col;
    });
  }, [columns, canAction, onView, onDelete]);

  return (
    <DataTable
      data={data}
      columns={tableColumns}
      pagination={pagination}
      emptyMessage="No Approval Document Category Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};

