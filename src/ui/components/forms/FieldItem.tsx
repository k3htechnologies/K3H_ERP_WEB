import React from 'react';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

export const FieldItem: React.FC<{
  label: string;
  value?: any;
  isRow?: boolean;
  className?: string;
  withBorder?: boolean;
  urls?: string | null;
}> = ({
  label,
  value,
  isRow = false,
  className = '',
  withBorder = false,
  urls = null,
}) => {
  const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : '-';
  const borderClass = withBorder ? 'border-b border-gray-200' : '';

  // parse urls (returns [])
  const imageUrls = parseDocumentUrls(urls);
  const hasDocs = imageUrls.length > 0;

  // Grid style for row layout: Label | ":" | Value
  // If you want different label width, change '180px' here.
  const rowGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '180px 16px 1fr',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  };

  // ROW layout: label : value
  if (isRow) {
    return (
      <div className={`${borderClass} py-2`}>
        <div style={rowGridStyle}>
          {/* Label */}
          <div className="text-sm font-medium text-[#1D1D1D80] truncate">
            {label}
          </div>

          {/* Colon */}
          <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>

          {/* Value (with optional document viewer) */}
          <div className="text-sm text-[#1D1D1D] font-medium break-words">
            {hasDocs ? (
              <MultiImageViewer
                images={imageUrls}
                title={label}
                triggerLabel={
                  // make trigger an inline button for accessibility/clickability
                  <button
                    type="button"
                    className="text-sm text-[#1D1D1D] font-medium text-left break-words whitespace-normal max-w-[400px] cursor-pointer p-0"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    {displayValue}
                  </button>
                }
              />
            ) : (
              <span className={`text-sm text-[#1D1D1D] font-medium text-left break-words whitespace-normal max-w-[400px] ${className}`}>
                {displayValue}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COLUMN layout (default) — unchanged visually except preserved classes
  return (
    <div className={`flex flex-col ${borderClass} ${className}`}>
      <span className="text-sm font-medium text-[#1D1D1D80] truncate">
        {label}
      </span>

      {hasDocs ? (
        <MultiImageViewer
          images={imageUrls}
          title={label}
          triggerLabel={
            <button
              type="button"
              className="mt-1 text-sm text-[#1D1D1D] font-medium cursor-pointer p-0"
              style={{ background: 'transparent', border: 'none' }}
            >
              {displayValue}
            </button>
          }
        />
      ) : (
        <span className={`mt-1 text-sm text-[#1D1D1D] font-medium ${className}`}>
          {displayValue}
        </span>
      )}
    </div>
  );
};
