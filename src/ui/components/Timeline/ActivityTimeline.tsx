import type { Key, ReactNode } from "react";

interface ActivityTimelineProps<T> {
  items: T[];
  // 1. Add isLast to the renderItem signature
  renderItem: (item: T, index: number, isLast: boolean) => ReactNode; 
  getKey?: (item: T, index: number) => Key;
  emptyState?: ReactNode;
  showPending?: boolean;
  className?: string;
  dotClassName?: string;
  lineClassName?: string;
  pendingDotClassName?: string;
  compact?: boolean;
}

const ActivityTimeline = <T,>({
  items,
  renderItem,
  getKey,
  emptyState = null,
  showPending = false,
  className = "",
  dotClassName = "bg-blue-600",
  lineClassName = "bg-blue-600",
  pendingDotClassName = "bg-blue-200",
  compact = false,
}: ActivityTimelineProps<T>) => {
  if (items.length === 0) return <>{emptyState}</>;

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={getKey?.(item, index) ?? index}
            className={compact ? "grid grid-cols-[12px_1fr] gap-2" : "grid grid-cols-[24px_1fr] gap-3"}
          >
            <div className="flex flex-col items-center">
              <span
                className={`${compact ? "h-3 w-3" : "h-4 w-4"} shrink-0 rounded-full ${dotClassName}`}
                aria-hidden="true"
              />
              {(!isLast || showPending) && (
                <span
                  className={`${compact ? "min-h-5 w-[2px]" : "min-h-6 w-[3px]"} flex-1 ${lineClassName}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={isLast && !showPending ? "" : compact ? "pb-[18px]" : "pb-5"}>
              {/* 2. Pass isLast here */}
              {renderItem(item, index, isLast)}
            </div>
          </div>
        );
      })}

      {showPending && (
        <div className={compact ? "grid grid-cols-[12px_1fr] gap-2" : "grid grid-cols-[24px_1fr] gap-3"}>
          <div className="flex justify-center">
            <span
              className={`${compact ? "h-3 w-3" : "h-4 w-4"} rounded-full ${pendingDotClassName}`}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;