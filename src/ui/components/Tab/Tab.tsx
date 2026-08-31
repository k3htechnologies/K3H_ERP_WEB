import React, { useEffect, useState } from "react";
import { COLORS } from "@/core/constants";
import { useViewportHeight } from "@/core/utils/useViewportHeight";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActive?: string;
  onTabChange?: (tab: TabItem) => void;
  islarge?: boolean
  isChips?: boolean;
  isvertical?: boolean;
  istoggleTab?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActive,
  onTabChange,
  islarge = false,
  isChips = false,
  isvertical = false,
  istoggleTab = false,
}) => {

  const [active, setActive] = useState<string | undefined>(tabs[0]?.id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const verticalTabHeight = useViewportHeight(255, 350, 900);

  useEffect(() => {
    if (defaultActive) {
      setActive(defaultActive);
    }
  }, [defaultActive]);

  // 🔹 Auto-select first tab when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !defaultActive) {
      setActive(tabs[0].id);
    }
  }, [tabs]);

  const handleChange = (tab: TabItem) => {
    setActive(tab.id);
    onTabChange?.(tab);
  };

  if (istoggleTab) {
    return (
      <div
        className="inline-flex items-center bg-[#F1F1F1] rounded-md p-1"
        style={{ border: "0.3px solid #0000003f" }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab)}
              className={`px-5 h-[36px] flex items-center rounded-md text-sm transition-all duration-200
              ${isActive
                  ? "bg-white text-blue-600 font-medium shadow-sm"
                  : "text-gray-500 hover:text-blue-500"
                }
            `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (isChips) {
    return (
      <div className="w-full border-b border-gray-200 overflow-x-auto scrollbar-hide thin-scroll">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = active === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleChange(tab)}
                className={`relative pb-2 text-sm font-medium transition-all duration-200
                ${isActive
                    ? "text-blue-600 font-medium text-[16px] leading-[140%] tracking-[0.01em]"
                    : "text-gray-400  font-normal text-[14px] leading-[140%] tracking-[0.01em] hover:text-blue-500"
                  }
              `}>
                {tab.label}
                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (isvertical) {
    return (
      <div className="w-full overflow-y-auto thin-scroll" style={{ maxHeight: verticalTabHeight}} >
        <div className="flex flex-col gap-2 w-full">
          {tabs.map((tab) => {

            const isActive = active === tab.id;

            return (
              <div key={tab.id} className="border-b border-gray-100 last:border-b-0" >
                <button
                  type="button"
                  onClick={() => handleChange(tab)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg text-sm transition
                                    ${isActive ? "bg-[#2563EB] text-white font-medium" : "text-gray-700 font-normal"}`}>
                  <span>{tab.label}</span>

                  <span className={`text-xs ${isActive ? "text-white font-medium" : "text-gray-400"}`}>
                    {tab.count ?? 0}
                  </span>
                  
                </button>
              </div>
            );

          })}
        </div>
      </div>
    );
  }

  return (

    <div className="w-full">
      <div className={`${islarge ? " flex flex-wrap gap-2" : " border-b border-blue-300 flex gap-2"}`}>

        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const isHovered = hoveredTab === tab.id;

          return (
            <label
              key={tab.id}
              onClick={() => handleChange(tab)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                flex: islarge ? "0 0 calc(20% - 10px)" : "unset",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.15s ease",
                border: islarge ? `0.5px solid #135bec63` : isActive ? `1px solid ${COLORS.primary1}` : "2px solid transparent",
                color: islarge && isActive ? '#135BEC' : isActive ? COLORS.black : isHovered ? COLORS.primary1 : "#4B5563",
                fontWeight: isActive || isHovered ? 600 : 400,
                backgroundColor: isActive ? "#135bec29" : ""
              }}
            >
              {tab.label}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
