import { convert_hh_mm_ss_to_hh_mm, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import type { GroupedCalendarEvent } from '@/features/teamWorkspaceCalendar/models/EventCalendarModel';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import { toLocalDateKey } from '@/ui/components/Calender/CalendarUtils';

export const groupEventsByType = (events: CalendarEvent[]): GroupedCalendarEvent[] =>
  Array.from(
    events.reduce((groups, event) => {
      const key = event.type?.toUpperCase() || 'EVENT';
      const group = groups.get(key) ?? [];
      group.push(event);
      groups.set(key, group);
      return groups;
    }, new Map<string, CalendarEvent[]>()),
  ).map(([type, grouped]) => ({
    type,
    firstEvent: grouped[0],
    label:
      type === 'CONFERENCE' && grouped.length === 1
        ? grouped[0].title || 'Conference'
        : `${type.charAt(0)}${type.slice(1).toLowerCase()} [${grouped.length}]`,
  }));

export const getMonthDateRange = (month: number, year: number) => {
  const fromDate = new Date(year, month - 1, 1);
  const toDate = new Date(year, month, 0);

  return {
    startDate: toLocalDateKey(fromDate),
    endDate: toLocalDateKey(toDate),
  };
};

export const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const getSidebarEventDetails = (
  event: CalendarEvent,
  type: string,
): string[] => {
  if (type === 'TASK') {
    const lines: string[] = [];
    const deadline = event.start?.split('T')[0];

    if (deadline) {
      lines.push(`Deadline: ${formatDate_dd_MonthName_yy(deadline)}`);
    }

    if (event.fullname?.trim()) {
      lines.push(`Assignee: ${event.fullname.trim()}`);
    }

    return lines;
  }

  const lines: string[] = [];
  const startTime = convert_hh_mm_ss_to_hh_mm(event.start?.split('T')[1]);
  const endTime = convert_hh_mm_ss_to_hh_mm(event.end?.split('T')[1]);

  if (startTime && endTime) {
    lines.push(`${startTime} - ${endTime}`);
  } else if (startTime) {
    lines.push(startTime);
  }

  if (event.room?.trim()) {
    lines.push(event.room.trim());
  }

  if (type === 'MEETING' && event.fullname?.trim()) {
    lines.push(event.fullname.trim());
  }

  return lines;
};
