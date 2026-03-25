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
  isIcon?: boolean;
  isUsedForInventoryFlat?: boolean;
  isSetValue?: boolean;
  isgoogleMap?: boolean;
}> = ({
  label,
  value,
  isRow = false,
  className = '',
  withBorder = false,
  urls = null,
  isIcon = false,
  isUsedForInventoryFlat = false,
  isSetValue = true,
}) => {

    // Check if value is a ReactNode (React element)
    const isReactNode = React.isValidElement(value);

    const displayValue = value !== undefined && value !== null && value !== ''
      ? (isReactNode ? value : String(value))
      : '-';
      
    const borderClass = withBorder ? 'border-b border-[#135bec2e]' : '';

    // parse urls (returns [])
    const imageUrls = parseDocumentUrls(urls);
    const hasDocs = imageUrls.length > 0 ? true : false;

    const rowGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: !isUsedForInventoryFlat ? '180px 16px 1fr' : '120px 16px 1fr',
      // gap: 8,
      gap: !isUsedForInventoryFlat ? 8 : 4,
      alignItems: 'center',
      width: '100%',
    };


    // ROW layout: label : value
    if (isRow) {
      return (
        <div className={`${borderClass} ${!isUsedForInventoryFlat ? withBorder ? 'pb-5' :"" : 'py-0.1'}`}>
          <div style={rowGridStyle}>

            {/* Label */}
            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
              {label}
            </div>

            {/* Colon */}
            <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>

            <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
              {hasDocs ? (
                <MultiImageViewer
                  images={imageUrls}
                  title={label}
                  triggerLabel={
                    isIcon === true ? (
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {isSetValue ? <span>{displayValue}</span> : ''}

                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-sm font-medium text-left break-words whitespace-pre-line max-w-[400px] cursor-pointer p-0 min-w-0 underline"
                        style={{ background: 'transparent', border: 'none', color: COLORS.primary1 }}
                      >
                        {displayValue}
                      </button>
                    )
                  }
                />
              ) : isReactNode ? (
                displayValue
              ) : (
                <span className={`mt-1 text-sm text-[#1D1D1D] font-medium break-words whitespace-pre-line ${className} min-w-0`}>
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
      <div className={`flex flex-col ${borderClass} ${className} min-w-0`}>
        <span className=" text-sm font-medium text-[#1D1D1D80] truncate">
          {label}
        </span>

        {hasDocs ? (
          <MultiImageViewer
            images={imageUrls}
            title={label}
            isIcon
            triggerLabel={
              isIcon === true ? (
                <span className="flex items-center gap-2 text-sm font-medium mt-1 ">
                  {isSetValue ? <span>{displayValue}</span> : ''}
                </span>
              ) : (
                <button
                  type="button"
                  className="text-sm font-medium text-left break-words whitespace-pre-line max-w-[400px] cursor-pointer p-0 min-w-0 underline"
                  style={{ background: 'transparent', border: 'none', color: COLORS.primary1 }}
                >
                  {displayValue}
                </button>
              )
            }
          />
        ) : isReactNode ? (
          <div className="mt-1">
            {displayValue}
          </div>
        ) : (
          <span className={`mt-1 text-sm text-[#1D1D1D] font-medium break-words whitespace-pre-line ${className} min-w-0`}>
            {displayValue}
          </span>
        )}
      </div>
    );
  };
