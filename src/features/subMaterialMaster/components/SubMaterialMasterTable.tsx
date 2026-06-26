import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { SubMaterialMasterData } from '@/features/subMaterialMaster/models/SubMaterialMasterModel';

interface SubMaterialMasterTableProps {
  data: SubMaterialMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: SubMaterialMasterData) => void;
  onEdit: (row: SubMaterialMasterData) => void;
  onDelete: (row: SubMaterialMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const SubMaterialMasterTable: React.FC<SubMaterialMasterTableProps> = ({
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
          render: (_value, row: SubMaterialMasterData) => (

            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!canAction) return;
                  onDelete(row)
                }}
                color='transparent'
                isborderRadius
                disabled={!canAction}
                size='sm'
                style={{
                  color: canAction ? 'red' : '#9CA3AF',
                  padding: '4px 8px',
                  cursor: canAction ? 'pointer' : 'not-allowed',
                  opacity: canAction ? 1 : 0.5
                }}
                title="Delete Sub Material"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

          )
        };
      }
      if (col.key === 'SubMaterialName') {
        return {
          ...col,
          render: (value, row: SubMaterialMasterData) => (
            <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
              <TooltipText
                text={value || '-'}
                maxWidth="400px"
                tooltipThreshold={30}
                onClick={() => onView(row)}
              />
            </div>
          )
        };
      }
      if (col.key === 'IsTolerant') {
        return {
          ...col,
          render: (value, _row: SubMaterialMasterData) => (
            <div className="text-center">
              {(value as boolean) ? 'Yes' : 'No'}
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
      emptyMessage="No Sub Materials Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
