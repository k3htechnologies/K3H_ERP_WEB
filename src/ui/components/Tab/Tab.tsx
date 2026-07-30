import React, { useEffect, useState } from "react";
import { COLORS } from "@/core/constants";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: readonly TabItem[];
  defaultActive?: string;
  activeTab?: string;
  onTabChange?: (tab: TabItem) => void;
  islarge?: boolean
  isChips?: boolean;
  istoggleTab?: boolean;
  isButtonGrid?: boolean;
  ariaLabel?: string;
  buttonGridClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActive,
  activeTab,
  onTabChange,
  islarge = false,
  isChips = false,
  istoggleTab = false,
  isButtonGrid = false,
  ariaLabel = "Tabs",
  buttonGridClassName = "",
}) => {

  const [active, setActive] = useState<string | undefined>(tabs[0]?.id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const selectedTabId = activeTab ?? active;

  useEffect(() => {
    if (defaultActive && activeTab === undefined) {
      setActive(defaultActive);
    }
  }, [activeTab, defaultActive]);

  // 🔹 Auto-select first tab when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !defaultActive && activeTab === undefined) {
      setActive(tabs[0].id);
    }
  }, [activeTab, defaultActive, tabs]);

  const handleChange = (tab: TabItem) => {
    setActive(tab.id);
    onTabChange?.(tab);
  };

  if (isButtonGrid) {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-3 ${buttonGridClassName}`}
      >
        {tabs.map((tab) => {
          const isActive = selectedTabId === tab.id;

          return (
            <button
              type="button"
              role="tab"
              key={tab.id}
              aria-selected={isActive}
              onClick={() => handleChange(tab)}
              className={`inline-flex h-[35px] w-full items-center justify-center rounded-[3px] border py-2 text-xs font-normal leading-none transition-colors ${
                isActive
                  ? "border-[#8CB0FF] bg-[#DCE7FC] text-[#235EEE]"
                  : "border-[#CFCFCF] bg-white text-[#8A8A8A] hover:border-[#AFC4EA] hover:text-[#235EEE]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (istoggleTab) {
    return (
      <div
        className="inline-flex items-center bg-[#F1F1F1] rounded-md p-1"
        style={{ border: "0.3px solid #0000003f" }}
      >
        {tabs.map((tab) => {
          const isActive = selectedTabId === tab.id;

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
      <div className="w-full border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = selectedTabId === tab.id;

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

                {/* underline */}
                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full"
                  />
                )}
              </button>
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
          const isActive = selectedTabId === tab.id;
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
