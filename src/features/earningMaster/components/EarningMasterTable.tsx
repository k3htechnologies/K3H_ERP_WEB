import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { EarningMasterData } from '@/features/earningMaster/models/EarningMasterModel';

interface EarningMasterTableProps {
  data: EarningMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: EarningMasterData) => void;
  onEdit: (row: EarningMasterData) => void;
  onDelete: (row: EarningMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const EarningMasterTable: React.FC<EarningMasterTableProps> = ({
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
          render: (_value, row: EarningMasterData) => (
            canAction ? (
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
                  title="Delete Earning"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }
      if (col.key === 'Name') {
        return {
          ...col,
          render: (value, row: EarningMasterData) => (
            <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
              <TooltipText
                text={value || 'N/A'}
                maxWidth="250px"
                tooltipThreshold={25}
                onClick={() => onView(row)}
              />
            </div>
          )
        };
      }
      if (col.key === 'MinSalary' || col.key === 'MaxSalary') {
        return {
          ...col,
          render: (value) => value ? `₹ ${value}` : '0'
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
      emptyMessage="No Earnings Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
