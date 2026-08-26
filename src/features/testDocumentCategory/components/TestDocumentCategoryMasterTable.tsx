import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { TestDocumentCategoryMasterData } from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';

interface TestDocumentCategoryMasterTableProps {
  data: TestDocumentCategoryMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: TestDocumentCategoryMasterData) => void;
  onDelete: (row: TestDocumentCategoryMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const TestDocumentCategoryMasterTable: React.FC<TestDocumentCategoryMasterTableProps> = ({
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
          render: (_value, row: TestDocumentCategoryMasterData) => {
            const isDisabled = !canAction || (row as any).DocumentCount > 0;

            return canAction ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isDisabled) return;
                    onDelete(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={isDisabled}
                  size="sm"
                  style={{
                    color: isDisabled ? '#9CA3AF' : 'red',
                    padding: '4px 8px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                  title={
                    (row as any).DocumentCount > 0
                      ? "Cannot delete: Documents exist"
                      : "Delete Test Document Category"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null;
          }
        };
      }

      if (col.key === 'TestDocumentCategoryName') {
        return {
          ...col,
          render: (value, row) => (
            <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
              <TooltipText
                text={value || '-'}
                maxWidth="900px"
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
      emptyMessage="No Test Document Category Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};

