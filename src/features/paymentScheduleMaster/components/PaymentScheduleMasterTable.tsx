import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Button } from '@/ui/components/forms';
import { Trash2 } from 'lucide-react';
import type { PaymentScheduleMasterData } from '@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel';

interface PaymentScheduleMasterTableProps {
  data: PaymentScheduleMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: PaymentScheduleMasterData) => void;
  onDelete: (row: PaymentScheduleMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const PaymentScheduleMasterTable: React.FC<PaymentScheduleMasterTableProps> = ({
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
          render: (_value, row: PaymentScheduleMasterData) =>
            canAction ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(row);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{
                    color: 'red',
                    padding: '4px 8px'
                  }}
                  title="Delete Payment Schedule"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
        };
      }

      if (col.key === 'Type') {
        return {
          ...col,
          render: (value, row: PaymentScheduleMasterData) => (
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => onView(row)}
            >
              {value || '-'}
            </span>
          )
        };
      }

      if (col.key === 'Date') {
        return {
          ...col,
          render: (value: number) => (value ? `₹ ${value}` : '-')
        };
      }

      if (col.key === 'Percentage') {
        return {
          ...col,
          render: (value: string | null) => value || '0'
        };
      }

      if (col.key === 'Cumulative') {
        return {
          ...col,
          render: (value: number) => (value ? `${value}%` : '-')
        };
      }

      if (col.key === 'Amount') {
        return {
          ...col,
          render: (value: number) => (value ? `₹ ${value}` : '-')
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
      emptyMessage="No Payment Schedule found."
      fixedHeight
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};


