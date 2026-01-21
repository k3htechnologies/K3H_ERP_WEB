import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import type { HolidayMasterData } from '@/features/holidayMaster/models/HolidayMasterModel';

interface HolidayMasterTableProps {
  data: HolidayMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: HolidayMasterData) => void;
  onEdit: (row: HolidayMasterData) => void;
  onDelete: (row: HolidayMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const HolidayMasterTable: React.FC<HolidayMasterTableProps> = ({
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
          render: (_value, row: HolidayMasterData) => (
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
                  title="Delete Holiday"
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
          render: (value, row: HolidayMasterData) => (
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
      if (col.key === 'HolidayURL') {
        return {
          ...col,
          render: (value, row: HolidayMasterData) => (
            <div className="flex items-center justify-start">
              <MultiImageViewer
                images={parseDocumentUrls(row.HolidayURL)}
                title="Holiday"
                isIcon={false}
                triggerLabel={value || '-'}
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
      emptyMessage="No Holiday Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
