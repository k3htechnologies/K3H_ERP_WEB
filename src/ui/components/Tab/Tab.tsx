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
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultActive,
    onTabChange,
}) => {
    const [active, setActive] = useState(defaultActive || tabs[0].id);
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    const handleChange = (tab: TabItem) => {
        setActive(tab.id);
        onTabChange?.(tab);
    };

    return (
        <div className="w-full pb-5">
            <div
                className="flex border-b border-blue-300"
                style={{ gap: 8 }}
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
                                display: "inline-flex",
                                alignItems: "center",

                                padding: "6px 14px",
                                borderRadius: 6,
                                cursor: "pointer",
                                transition: "all 0.15s ease",

                                // ✅ border
                                border: isActive
                                    ? `2px solid ${COLORS.primary1}`
                                    : "2px solid transparent",


                                // ✅ text color
                                color: isActive
                                    ? COLORS.primary1
                                    : isHovered
                                        ? COLORS.primary1
                                        : "#4B5563",
                                fontWeight: isActive || isHovered ? 600 : 400
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
