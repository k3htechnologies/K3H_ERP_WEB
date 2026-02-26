import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { WeekOffMappingMasterData } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

interface WeekOffMappingMasterTableProps {
  data: WeekOffMappingMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: WeekOffMappingMasterData) => void;
  onEdit: (row: WeekOffMappingMasterData) => void;
  onDelete: (row: WeekOffMappingMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const WeekOffMappingMasterTable: React.FC<WeekOffMappingMasterTableProps> = ({
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
          render: (_value, row: WeekOffMappingMasterData) => (
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
                  title="Delete Weekoff Mapping"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }
      if (col.key === 'WeekOffPolicyName') {
        return {
          ...col,
          render: (value, row: WeekOffMappingMasterData) => (
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
      emptyMessage="No Week off Mappings Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
