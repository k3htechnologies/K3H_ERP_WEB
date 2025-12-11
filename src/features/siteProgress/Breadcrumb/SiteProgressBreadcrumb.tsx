import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
  state?: any;
}

interface SiteProgressBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const SiteProgressBreadcrumb: React.FC<SiteProgressBreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path, { state: item.state || {} });
    }
  };

  const visibleItems = items.filter(it => typeof it?.label === "string" && it.label.trim() !== "");

  if (visibleItems.length === 0) {
    return null; 
  }

  return (
   
    <nav className="flex items-center space-x-2 text-sm mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
      

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.path || item.onClick ? (
            <button
              onClick={() => handleBreadcrumbClick(item)}
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              title={item.label}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-700 font-semibold" title={item.label}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

