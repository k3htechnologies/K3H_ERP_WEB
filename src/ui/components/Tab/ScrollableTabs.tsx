import React, { useEffect, useRef } from "react";
import { Button } from "@/ui/components/forms";

export interface ScrollableTabItem<TId extends string | number = string> {
  id: TId;
  label: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface ScrollableTabsProps<TId extends string | number = string> {
  tabs?: readonly ScrollableTabItem<TId>[];
  activeTab: TId;
  onChange: (tabId: TId) => void;
  ariaLabel?: string;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  dragSpeed?: number;
  scrollActiveTabIntoView?: boolean;
}

export function ScrollableTabs<TId extends string | number = string>({
  tabs = [],
  activeTab,
  onChange,
  ariaLabel = "Tabs",
  className = "",
  tabListClassName = "",
  tabClassName = "",
  activeTabClassName = "bg-[#EEF2FF] text-[#2563EB] border-[#93C5FD]",
  inactiveTabClassName =
    "bg-white text-gray-600 border-gray-200 hover:!bg-gray-50 hover:!text-[#2563EB]",
  dragSpeed = 1.5,
  scrollActiveTabIntoView = true,
}: ScrollableTabsProps<TId>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<TId, HTMLButtonElement>());
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  useEffect(() => {
    if (!scrollActiveTabIntoView) return;
    tabRefs.current.get(activeTab)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeTab, scrollActiveTabIntoView]);

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
          startScrollLeftRef.current - distance * dragSpeed;
      }}
      onMouseUp={() => {
        isDraggingRef.current = false;
      }}
      onMouseLeave={() => {
        isDraggingRef.current = false;
      }}
      className={`w-full cursor-grab overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing ${className}`}
    >
      <div className={`flex w-max min-w-full flex-nowrap gap-2.5 ${tabListClassName}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Button
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
              color="transparent"
              onClick={() => onChange(tab.id)}
              style={{
                height: 32,
                padding: "6px 16px",
                backgroundColor: isActive ? "#EEF2FF" : "#FFFFFF",
                color: isActive ? "#2563EB" : "#4B5563",
                border: isActive
                  ? "1px solid #93C5FD"
                  : "1px solid #E5E7EB",
                whiteSpace: "nowrap",
                fontFamily: "Montserrat, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "140%",
                letterSpacing: "0.02em",
              }}
              className={`shrink-0 select-none rounded-md border text-xs transition-all ${
                isActive ? activeTabClassName : inactiveTabClassName
              } ${tabClassName}`}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default ScrollableTabs;
