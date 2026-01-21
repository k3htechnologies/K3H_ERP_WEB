import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { ShiftMappingMasterData } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';

interface ShiftMappingMasterTableProps {
  data: ShiftMappingMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: ShiftMappingMasterData) => void;
  onEdit: (row: ShiftMappingMasterData) => void;
  onDelete: (row: ShiftMappingMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const ShiftMappingMasterTable: React.FC<ShiftMappingMasterTableProps> = ({
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
          render: (_value, row: ShiftMappingMasterData) => (
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
                  title="Delete Shift Mapping"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }
      if (col.key === 'ShiftName') {
        return {
          ...col,
          render: (value, row: ShiftMappingMasterData) => (
            <div className="flex items-center justify-start">
              <TooltipText
                text={value || '-'}
                maxWidth="250px"
                tooltipThreshold={25}
                onClick={() => onView(row)}
              />
            </div>
          )
        };
      }
      if (col.key === 'DepartmentName' || col.key === 'EmployeeName') {
        return {
          ...col,
          render: (value) => (
            <TooltipText
              text={value || '-'}
              maxWidth="200px"
              tooltipThreshold={20}
            />
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
      emptyMessage="No Shift Mappings Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
