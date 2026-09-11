import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  id?: string;
  label: string;
  path?: string;
  onClick?: () => void;
  state?: unknown;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  isinline?: boolean;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  ariaLabel?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  isinline = false,
  className = '',
  onItemClick,
  ariaLabel = 'Breadcrumb',
}) => {
  const navigate = useNavigate();

  const visibleItems = items.filter(
    (item) => typeof item?.label === 'string' && item.label.trim() !== '',
  );

  if (visibleItems.length === 0) {
    return null;
  }

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (onItemClick) {
      onItemClick(item, index);
      return;
    }

    if (item.path) {
      navigate(item.path, { state: item.state ?? {} });
    }
  };

  const navClassName = isinline
    ? `flex min-w-0 items-center gap-2 text-base font-semibold text-gray-900 ${className}`.trim()
    : `mb-4 flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm ${className}`.trim();

  const separatorClassName = isinline ? 'text-gray-500' : 'text-gray-400';

  return (
    <nav className={navClassName} aria-label={ariaLabel}>
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        const isClickable = Boolean(item.path || item.onClick || onItemClick);
        const itemKey = item.id ?? `${item.label}-${index}`;

        return (
          <React.Fragment key={itemKey}>
            {index > 0 && (
              <ChevronRight
                className={`h-4 w-4 shrink-0 ${separatorClassName}`}
                aria-hidden
              />
            )}

            {isClickable && !isLast ? (
              <button
                type="button"
                onClick={() => handleItemClick(item, index)}
                className={
                  isinline
                    ? 'shrink-0 text-left text-gray-900 transition-colors hover:text-blue-600'
                    : 'text-left font-medium text-blue-600 transition-colors hover:text-blue-800'
                }
                title={item.label}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={
                  isinline
                    ? 'min-w-0 truncate text-gray-900'
                    : 'font-semibold text-gray-700'
                }
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
