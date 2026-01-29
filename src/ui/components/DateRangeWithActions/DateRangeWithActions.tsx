import React from 'react';
import { DateRangeSelector } from '@/ui/components/forms/DateRangeSelector';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';

export interface DateRangeWithActionsProps {
  // Date Range Props
  fromDate: string | null;
  toDate: string | null;
  onBothDatesChange: (fromDate: string | null, toDate: string | null) => void;
  onFromDateChange: (date: string | null) => void;
  onToDateChange: (date: string | null) => void;
  
  // Permissions
  canAction?: boolean;
  canExport?: boolean;
  
  // Add Button Props
  addTitle?: string;
  onAdd?: () => void;
  
  // Export Props
  hasData?: boolean;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  exportLoading?: boolean;
  
  // Optional: Additional props for TableActionToolbar
  isShowSearchBar?: boolean;
  isShowFilterButton?: boolean;
  isShowCustomizeButton?: boolean;
}

export const DateRangeWithActions: React.FC<DateRangeWithActionsProps> = ({
  fromDate,
  toDate,
  onBothDatesChange,
  onFromDateChange,
  onToDateChange,
  canAction = false,
  canExport = false,
  addTitle = 'Add',
  onAdd,
  hasData = false,
  onExportExcel,
  onExportPdf,
  exportLoading = false,
  isShowSearchBar = false,
  isShowFilterButton = false,
  isShowCustomizeButton = false,
}) => {
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="relative min-w-0 w-[526px]">
          <DateRangeSelector
            fromDate={fromDate}
            toDate={toDate}
            onBothDatesChange={onBothDatesChange}
            onFromDateChange={onFromDateChange}
            onToDateChange={onToDateChange}
          />
        </div>
      </div>

      <TableActionToolbar
        isShowSearchBar={isShowSearchBar}
        isShowFilterButton={isShowFilterButton}
        isShowCustomizeButton={isShowCustomizeButton}
        // ADD
        isShowAddButton={canAction}
        addTitle={addTitle}
        onAdd={onAdd}
        // EXPORT
        isShowExportButton={canExport && hasData}
        onExportExcel={onExportExcel}
        onExportPdf={onExportPdf}
        exportLoading={exportLoading}
      />
    </div>
  );
};

