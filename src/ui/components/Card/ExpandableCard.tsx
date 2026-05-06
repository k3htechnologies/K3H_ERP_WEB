import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface ExpandableCardProps {
  title?: React.ReactNode;
  item?: any;
  showline: boolean;
  height?: number;
  expandedheight?: number;
  customizedIcon?: ReactNode;
  child: ReactNode;
  defaultOpen?: boolean;
  onClick?: (isOpen: boolean) => void;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  showline,
  customizedIcon,
  child,
  height = 50,
  expandedheight = 282,
  defaultOpen = false,
  onClick
}) => {
  const [isExpandableOpen, setExpandableOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#F9FAFB] border border-[#135BEC30] rounded-[10px] shadow-md">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => {
        const nextState = !isExpandableOpen;
        setExpandableOpen(nextState);
        if (onClick) {
          onClick(nextState);
        }
      }} style={{ height: height }} >
        <span className="font-medium text-gray-800">{title}</span>

        <div className="flex items-center gap-2">

          {customizedIcon && (
            <div className="flex items-center rounded-md">
              {customizedIcon}
            </div>
          )}

          {/* Chevron INSIDE background box */}
          <div className="w-7 h-7 bg-[#135BEC30] rounded-md flex items-center justify-center">
            <ChevronDown
              className={`h-5 stroke-[#135BEC] transition-transform duration-200 ${isExpandableOpen ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>


      </div>

      {isExpandableOpen && showline && (
        <div className="border-t border-[#00000026] mx-4"></div>
      )}

      {isExpandableOpen && (
        <div className="p-4 text-sm text-gray-600 min-h-[180px] overflow-y-auto thin-scroll scroll-smooth" style={{ maxHeight: expandedheight }}>
          {child}
        </div>
      )}
    </div>
  );
};