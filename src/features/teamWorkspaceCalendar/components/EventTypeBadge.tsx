import React from 'react';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import { getEventColorClass } from '@/ui/components/Calender/CalendarUtils';

interface EventTypeBadgeProps {
  label: string;
  event: CalendarEvent;
  onEventClick?: (event: CalendarEvent) => void;
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({
  label,
  event,
  onEventClick,
}) => {
  return (
    <div
      className={`block w-full truncate rounded border-l-[3px] px-2 py-1.5 text-left text-[10px] font-medium ${getEventColorClass(event)}`}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
    >
      {label}
    </div>
  );
};

export default EventTypeBadge;
