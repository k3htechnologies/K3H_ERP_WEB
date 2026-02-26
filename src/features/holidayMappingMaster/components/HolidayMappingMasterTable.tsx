import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { HolidayMappingMasterData } from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';

interface HolidayMappingMasterTableProps {
  data: HolidayMappingMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: HolidayMappingMasterData) => void;
  onEdit: (row: HolidayMappingMasterData) => void;
  onDelete: (row: HolidayMappingMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const HolidayMappingMasterTable: React.FC<HolidayMappingMasterTableProps> = ({
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
          render: (_value, row: HolidayMappingMasterData) => (
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
                  title="Delete Holiday Mapping"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }
      if (col.key === 'HolidayName') {
        return {
          ...col,
          render: (value, row: HolidayMappingMasterData) => (
            <div className="flex items-center justify-start">
              <TooltipText
                text={value || '-'}
                maxWidth="400px"
                tooltipThreshold={50}
                onClick={() => onView(row)}
              />
            </div>
          )
        };
      }
      if (col.key === 'HolidayDate') {
        return {
          ...col,
          render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
        };
      }
      if (col.key === 'BranchName') {
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
      emptyMessage="No Holiday Mapping Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
