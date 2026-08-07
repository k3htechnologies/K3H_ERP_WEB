import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "@/core/constants";

export interface TabItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  ariaLabel?: string;
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
  isCalendarTabs?: boolean;
  isScrollable?: boolean;
  isDescriptionCards?: boolean;
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
  isCalendarTabs = false,
  isScrollable = false,
  isDescriptionCards = false,
  ariaLabel = "Tabs",
  buttonGridClassName = "",
}) => {

  const [active, setActive] = useState<string | undefined>(tabs[0]?.id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
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

  useEffect(() => {
    if (!isScrollable || !selectedTabId) return;

    tabRefs.current.get(selectedTabId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [isScrollable, selectedTabId]);

  const handleChange = (tab: TabItem) => {
    if (tab.disabled) return;
    setActive(tab.id);
    onTabChange?.(tab);
  };

  if (isDescriptionCards) {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        {tabs.map((tab) => {
          const isActive = selectedTabId === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.ariaLabel}
              disabled={tab.disabled}
              onClick={() => handleChange(tab)}
              className={`min-h-[64px] rounded-md border px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? "border-[#4F83FF] bg-[#EAF1FF]"
                  : "border-[#4F83FF] bg-white hover:bg-[#F7F9FF]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[#202229]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-[#1769FF]">
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-[#1769FF]" />
                  )}
                </span>
                {tab.label}
              </span>
              {tab.description && (
                <span className="ml-6 mt-1 block text-[11px] font-normal leading-4 text-[#98A0AD]">
                  {tab.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (isScrollable) {
    if (tabs.length === 0) return null;

    return (
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          isDraggingRef.current = true;
          startXRef.current = event.clientX;
          startScrollLeftRef.current = event.currentTarget.scrollLeft;
        }}
        onMouseMove={(event) => {
          if (!isDraggingRef.current) return;

          const distance = event.clientX - startXRef.current;
          event.preventDefault();
          event.currentTarget.scrollLeft =
            startScrollLeftRef.current - distance * 1.5;
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
        }}
        className="w-full cursor-grab overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
      >
        <div className="flex w-max min-w-full flex-nowrap gap-2.5">
          {tabs.map((tab) => {
            const isActive = selectedTabId === tab.id;

            return (
              <button
                ref={(element) => {
                  if (element) tabRefs.current.set(tab.id, element);
                  else tabRefs.current.delete(tab.id);
                }}
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={tab.ariaLabel}
                disabled={tab.disabled}
                onClick={() => handleChange(tab)}
                className={`h-8 shrink-0 select-none whitespace-nowrap rounded-md border px-4 text-xs font-normal leading-[140%] tracking-[0.02em] transition-all ${
                  isActive
                    ? "border-[#93C5FD] bg-[#EEF2FF] text-[#2563EB]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#2563EB]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (isCalendarTabs) {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex overflow-hidden rounded-md border border-[#CCD4E3] bg-white"
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
              className={`flex h-8 min-w-[62px] items-center justify-center px-4 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#2364DB] text-white"
                  : "text-[#596170] hover:bg-[#F5F7FB]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

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
              aria-label={tab.ariaLabel}
              disabled={tab.disabled}
              onClick={() => handleChange(tab)}
              className={`inline-flex h-[35px] w-full items-center justify-center rounded-[3px] border py-2 text-xs font-normal leading-none transition-colors ${
                isActive
                  ? "border-[#8CB0FF] bg-[#DCE7FC] text-[#235EEE]"
                  : "border-[#CFCFCF] bg-white text-[#8A8A8A] hover:border-[#AFC4EA] hover:text-[#235EEE]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
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
