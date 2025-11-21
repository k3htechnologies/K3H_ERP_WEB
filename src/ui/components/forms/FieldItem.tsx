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
  isRow,
  className,
  withBorder,
  urls,
}) => {
    const displayValue = value && value !== '' ? value : '-';
    const borderClass = withBorder ? 'border-b border-gray-200' : '';

    // 🧩 Parse URLs once, reuse
    const imageUrls = parseDocumentUrls(urls);
    const hasDocs = imageUrls.length > 0;

    // 🔹 Row layout (label left, value right)
    if (isRow) {
      return (
        <div className={`flex justify-between items-start py-2 ${borderClass}`}>
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>

          {hasDocs ? (
            <MultiImageViewer
              images={imageUrls}
              title={label}
              triggerLabel={
                <span
                  className={`text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px] cursor-pointer ${className}`}
                >
                  {displayValue}
                </span>
              }
            />
          ) : (
            <span
              className={`text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px] ${className}`}
            >
              {displayValue}
            </span>
          )}
        </div>
      );
    }

    // 🔹 Column layout
    return (
      <div className={`flex flex-col ${borderClass}`}>
        <span className="text-md font-medium text-gray-500">
          {label}
        </span>

        {hasDocs ? (
          <MultiImageViewer
            images={imageUrls}
            title={label}
            triggerLabel={
              <span
                className={`mt-1 text-sm text-blue-600 font-medium cursor-pointer ${className}`}
              >
                {displayValue}
              </span>
            }
          />
        ) : (
          <span
            className={`mt-1 text-sm text-blue-600 font-medium ${className}`}
          >
            {displayValue}
          </span>
        )}
      </div>
    );
  };
