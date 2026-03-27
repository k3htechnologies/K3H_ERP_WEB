import React, { useMemo } from "react";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import type { PaymentScheduleSchemeMasterData } from "@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import { Trash2 } from "lucide-react";

interface PaymentScheduleSchemeMasterTableProps {
  data: PaymentScheduleSchemeMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: PaymentScheduleSchemeMasterData) => void;
  onEdit: (row: PaymentScheduleSchemeMasterData) => void;
  onDelete: (row: PaymentScheduleSchemeMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const PaymentScheduleSchemeMasterTable: React.FC<PaymentScheduleSchemeMasterTableProps> = ({ data, columns, pagination, sortInfo, onSort, onView, onDelete, canAction, loading }) => {
  const tableColumns = useMemo<TableColumn[]>(() => {
    return columns.map((col) => {
      if (col.key === "Actions") {
        return {
          ...col,
          render: (_value, row: PaymentScheduleSchemeMasterData) => {

            const isDisabled = !canAction || row.IsExistsPaymentScheduleScheme;

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
                    color: isDisabled ? "#9CA3AF" : "red",
                    padding: "4px 8px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  title={
                    row.IsExistsPaymentScheduleScheme
                      ? "Cannot delete: Scheme already in use"
                      : "Delete Scheme"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null;
          },
        };
      }
      if (col.key === "PaymentScheduleScheme") {
        return {
          ...col,

          render: (value, row) => (
            <div className={`flex items-center ${canAction ? "justify-between" : "justify-start"}`}>
              <TooltipText text={value || "-"} maxWidth="300px" tooltipThreshold={40} onClick={() => onView(row)} />
            </div>
          ),
        };
      }

      return col;
    });
  }, [columns, canAction, onView, onDelete]);

  return <DataTable data={data} columns={tableColumns} pagination={pagination} emptyMessage="No Payment Schedule Scheme Data Found" fixedHeight={true} recordsPerPage={20} className="flex-1" sortInfo={sortInfo} onSort={onSort} loading={loading} />;
};
