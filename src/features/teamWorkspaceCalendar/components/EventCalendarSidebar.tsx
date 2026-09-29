import React, { useMemo } from 'react';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { TYPE_SECTIONS } from '@/features/teamWorkspaceCalendar/constants/eventCalendarConstants';
import type { SidebarSection } from '@/features/teamWorkspaceCalendar/models/EventCalendarModel';
import { getSidebarEventDetails, isSameDay } from '@/features/teamWorkspaceCalendar/utils/eventCalendarUtils';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';

interface EventCalendarSidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export const EventCalendarSidebar: React.FC<EventCalendarSidebarProps> = ({
  currentDate,
  events,
  onEventClick,
}) => {
  const groupedSections = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const type = event.type ?? 'EVENT';
      const existing = groups.get(type) ?? [];
      existing.push(event);
      groups.set(type, existing);
    });

    return TYPE_SECTIONS.filter((section) => groups.has(section.key)).map(
      (section) => ({
        key: section.key,
        label: section.label,
        tone: section.tone,
        events: groups.get(section.key) ?? [],
      }),
    ) as SidebarSection[];
  }, [events]);

  const scheduleTitle = isSameDay(currentDate, new Date())
    ? "Today's Schedule"
    : formatDate_dd_MonthName_yy(currentDate);

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:w-[300px] lg:self-stretch">
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-900">
          {scheduleTitle}
        </h2>

        <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {groupedSections.length === 0 ? (
            <NoDataView
              message="No events for this day"
              className="py-6"
              iconClassName="!h-16 !w-16"
            />
          ) : (
            groupedSections.map((section) => (
              <div key={section.key} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.label} [{section.events.length}]
                </h3>

                {section.events.map((event) => {
                  const details = getSidebarEventDetails(event, section.key);

                  return (
                    <article
                      key={event.id}
                      className={`border-l-[3px] pl-2.5 ${section.tone} ${
                        onEventClick
                          ? 'cursor-pointer rounded-r hover:bg-gray-50'
                          : ''
                      }`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <h4 className="text-sm font-semibold text-gray-900">
                        <TooltipText
                          text={event.title || section.label}
                          maxWidth="100%"
                          tooltipThreshold={28}
                          isApplyBgTextColor
                        />
                      </h4>

                      {details.map((detail) => (
                        <p key={detail} className="text-xs leading-5 text-gray-500">
                          &bull; {detail}
                        </p>
                      ))}
                    </article>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default EventCalendarSidebar;
