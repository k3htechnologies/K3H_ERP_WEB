import React, { useState } from "react";
import { COLORS } from "@/core/constants";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActive?: string;
  onTabChange?: (tab: TabItem) => void;
  islarge?: boolean
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActive,
  onTabChange,
  islarge=false
}) => {

  const [active, setActive] = useState(defaultActive || tabs[0].id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleChange = (tab: TabItem) => {
    setActive(tab.id);
    onTabChange?.(tab);
  };


  return (

    <div className="w-full pb-2">
      <div
        className={`${islarge ? " flex flex-wrap gap-2" : " border-b border-blue-300 flex gap-2"
          }`}
      >

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
                backgroundColor:isActive  ? "#135bec29" : ""
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
