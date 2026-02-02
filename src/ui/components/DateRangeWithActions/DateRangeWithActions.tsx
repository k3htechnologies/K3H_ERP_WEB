import React, { useState, useRef, useEffect } from 'react';
import { DateRangeSelector } from '@/ui/components/forms/DateRangeSelector';
import { Button } from '@/ui/components/forms';
import { Download, Plus } from 'lucide-react';

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
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };

    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  const hasExportOptions = onExportExcel || onExportPdf;

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative min-w-0 w-[526px]">
          <DateRangeSelector
            fromDate={fromDate}
            toDate={toDate}
            onBothDatesChange={onBothDatesChange}
            onFromDateChange={onFromDateChange}
            onToDateChange={onToDateChange}
          />
        </div>

        {/* RIGHT SIDE: Export and Add Buttons */}
        <div className="flex items-center space-x-3">
          {/* EXPORT BUTTON */}
          {canExport && hasData && hasExportOptions && (
            <div className="relative" ref={exportRef}>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // If only one export option, call it directly; otherwise show dropdown
                  if (onExportExcel && !onExportPdf) {
                    onExportExcel();
                  } else if (onExportPdf && !onExportExcel) {
                    onExportPdf();
                  } else {
                    setIsExportOpen((prev) => !prev);
                  }
                }}
                color="blue"
                colorMode="gradient_light"
                size="mxs"
                defineWidth
                title="Export"
                aria-expanded={isExportOpen}
                style={{ width: '95px' }}
                leftIcon={<Download className="h-4 w-4" />}
                disabled={exportLoading}
              >
                <span>Export</span>
              </Button>

              {/* EXPORT DROPDOWN */}
              {isExportOpen &&  (
                <div
                  className="absolute right-0 mt-2 min-w-[168px] bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-50"
                  role="menu"
                  aria-label="Export options"
                >
                  <div className="py-1">
                    {onExportExcel && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onExportExcel();
                          setIsExportOpen(false);
                        }}
                        disabled={exportLoading}
                        color="transparent"
                        fullWidth
                        isborderRadius
                        size="sm"
                        title="Export as Excel"
                        style={{ justifyContent: "left" }}
                      >
                        Export as Excel
                      </Button>
                    )}
                    {onExportPdf && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onExportPdf();
                          setIsExportOpen(false);
                        }}
                        disabled={exportLoading}
                        color="transparent"
                        fullWidth
                        isborderRadius
                        size="sm"
                        title="Export as PDF"
                        style={{ justifyContent: "left" }}
                      >
                        Export as PDF
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD BUTTON */}
          {canAction && onAdd && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdd();
              }}
              color="blue"
              size="mxs"
              variant="solid"
              colorMode="gradient_dark"
              defineWidth
              title={addTitle}
              aria-label={addTitle}
              style={{ width: '95px' }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              <span>{addTitle}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
