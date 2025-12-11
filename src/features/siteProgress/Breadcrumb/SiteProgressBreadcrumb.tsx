import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
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
      navigate(item.path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
      <button
        onClick={() => navigate('/siteProgress')}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        title="Site Progress"
      >
        <Home className="h-4 w-4 mr-1" />
        <span className="font-medium">Site Progress</span>
      </button>

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

