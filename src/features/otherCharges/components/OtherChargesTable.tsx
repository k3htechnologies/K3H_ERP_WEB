import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Button } from '@/ui/components/forms';
import { Trash2 } from 'lucide-react';
import type { OtherChargesData } from '@/features/otherCharges/models/OtherChargesModel';

interface OtherChargesTableProps {
  data: OtherChargesData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: OtherChargesData) => void;
  onDelete: (row: OtherChargesData) => void;
  canAction: boolean;
  loading: boolean;
}

export const OtherChargesTable: React.FC<OtherChargesTableProps> = ({
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
          render: (_value, row: OtherChargesData) =>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                     if (!canAction) return;
                    onDelete(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!canAction}
                  size="sm"
                  style={{
                    color: canAction ? 'red' : '#9CA3AF',
                    padding: '4px 8px',
                    cursor: canAction ? 'pointer' : 'not-allowed',
                    opacity: canAction ? 1 : 0.5
                  }}
                  title="Delete Other Charge"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
        };
      }

      if (col.key === 'ChargeName') {
        return {
          ...col,
          render: (value, row: OtherChargesData) => (
            <span className="text-[#135BEC] font-medium cursor-pointer hover:underline" onClick={() => onView(row)} >
              {value || '-'}
            </span>
          )
        };
      }

      if (col.key === 'Value') {
        return {
          ...col,
          render: (value: number) => (value ? `₹ ${value}` : '-')
        };
      }

      if (col.key === 'CalculatedOn') {
        return {
          ...col,
          render: (value: string | null) => value || '0'
        };
      }

      if (col.key === 'GSTPercentage') {
        return {
          ...col,
          render: (value: number) => (value ? `${value}%` : '-')
        };
      }

      if (col.key === 'GSTValue') {
        return {
          ...col,
          render: (value: number) => (value ? `₹ ${value}` : '-')
        };
      }

      if (col.key === 'Total') {
        return {
          ...col,
          render: (_value, row: OtherChargesData) => (
            <span>
              ₹ {(Number(row.Value || 0) + Number(row.GSTValue || 0)).toFixed(2)}
            </span>
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
      emptyMessage="No Other Charges Data found"
      fixedHeight
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};


