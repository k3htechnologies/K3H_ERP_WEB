import React from 'react';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { COLORS } from '@/core/constants';

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
  const borderClass = withBorder ? 'border-b border-[#135bec2e]' : '';

  // parse urls (returns [])
  const imageUrls = parseDocumentUrls(urls);
  const hasDocs = imageUrls.length > 0;

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

          {/* Value (with optional document viewer)
              IMPORTANT: add `min-w-0` so this grid cell can shrink and allow wrapping */}
          <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
            {hasDocs ? (
              <MultiImageViewer
                images={imageUrls}
                title={label}
                triggerLabel={
                  // inline button — make it able to wrap with min-w-0 + whitespace-normal
                  <button
                    type="button"
                    className="text-sm text-[#1D1D1D] font-medium text-left break-words whitespace-normal max-w-[400px] cursor-pointer p-0 min-w-0 underline"
                    style={{ background: 'transparent', border: 'none', color: COLORS.primary1 }}
                  >
                    {displayValue}
                  </button>
                }
              />
            ) : (
              <span
                className={`text-sm text-[#1D1D1D] font-medium text-left break-words whitespace-normal max-w-[400px] ${className} min-w-0`}
              >
                {displayValue}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COLUMN layout (default)
  return (
    // ensure outer can shrink if used inside flex
    <div className={`flex flex-col ${borderClass} ${className} min-w-0`}>
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
              className="mt-1 text-sm text-[#1D1D1D] font-medium cursor-pointer p-0 break-words whitespace-normal min-w-0"
              style={{ background: 'transparent', border: 'none' }}
            >
              {displayValue}
            </button>
          }
        />
      ) : (
        <span className={`mt-1 text-sm text-[#1D1D1D] font-medium break-words whitespace-normal ${className} min-w-0`}>
          {displayValue}
        </span>
      )}
    </div>
  );
};
