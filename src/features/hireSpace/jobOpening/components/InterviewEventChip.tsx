import React from 'react';
import { getEventTime } from '@/features/hireSpace/jobOpening/utils/jobOpeningUtils';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

interface InterviewEventChipProps {
  event: CalendarEvent;
  onEventClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export const InterviewEventChip: React.FC<InterviewEventChipProps> = ({
  event,
  onEventClick,
  compact = false,
}) => (
  <button
    type="button"
    title={`${getEventTime(event)} - ${event.title}`}
    className={`shrink-0 rounded border border-red-200 bg-red-50 text-left text-red-900 hover:bg-red-100 ${
      compact ? 'max-w-[140px] px-1.5 py-0.5' : 'min-w-[120px] max-w-[180px] px-2 py-1'
    }`}
    onClick={(clickEvent) => {
      clickEvent.stopPropagation();
      onEventClick?.(event);
    }}
  >
    <span className={`block font-semibold ${compact ? 'text-[10px]' : 'text-xs'}`}>
      {getEventTime(event)}
    </span>
    <TooltipText
      text={event.title || '-'}
      maxWidth="100%"
      tooltipThreshold={compact ? 12 : 16}
      isApplyBgTextColor
      tooltipClassName={`${compact ? 'text-[10px]' : 'text-xs'} text-left text-red-900`}
    />
  </button>
);
