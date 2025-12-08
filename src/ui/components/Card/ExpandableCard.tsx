import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface ExpandableCardProps {
  title?: string;
  showline: boolean;
  customizedIcon?: ReactNode;
  child? : ReactNode; 
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  showline,
  customizedIcon,
  child,
}) => {
  const [isExpandableOpen, setExpandableOpen] = useState(false);

  return (
    <div className="bg-[#F9FAFB] border border-[#135BEC30] rounded-md shadow-md">
      <div
        className="h-12 flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpandableOpen((prev) => !prev)}
      >
        <span className="font-medium text-gray-800">{title}</span>

        <div className="w-7 h-7 bg-[#135BEC30] rounded-md flex items-center justify-center">
          {customizedIcon ? (
            customizedIcon
          ) : (
            <ChevronDown
              className={`h-5 stroke-[#135BEC] transition-transform duration-200 ${
                isExpandableOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {isExpandableOpen && showline && (
        <div className="border-t border-[#135BEC30] mx-4"></div>
      )}

      {isExpandableOpen && (
        <div className="p-4 text-sm text-gray-600 min-h-[180px] max-h-64 overflow-y-auto scroll-smooth">
          {child}
        </div>
      )}
    </div>
  );
};