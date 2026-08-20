import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import type { EventData } from '@/features/event/event/models/EventModel';

export const buildEventDateTime = (date?: string | null, time?: string | null) => {
    if (!date) return null;

    if (time) {
        return `${date.split('T')[0]}T${time}:00`;
    }

    return date;
};

export const toLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getNormalizedEventType = (type?: string | null) => {
    const normalizedType = type?.toUpperCase();

    if (normalizedType?.includes('CONFERENCE')) return 'CONFERENCE';
    if (normalizedType === 'TASK' || normalizedType === 'MEETING') return normalizedType;

    return undefined;
};

export const buildCalendarEvents = (eventList: EventData[]): CalendarEvent[] =>
    eventList
        .map((ev) => {
            const isTask = ev.Type?.toUpperCase() === 'TASK';
            const start = buildEventDateTime(isTask ? ev.DeadlineDate : ev.Date, isTask ? '' : ev.StartTime);
            const end = buildEventDateTime(isTask ? ev.DeadlineDate : ev.Date, isTask ? '' : ev.EndTime);
            const eventType = getNormalizedEventType(ev.Type);

            if (!start) return null;

            return {
                id: String(ev.EventId),
                type: eventType,
                color:
                    eventType === 'TASK'
                        ? 'blue'
                        : eventType === 'CONFERENCE'
                            ? 'green'
                            : 'orange',
                title: ev.Title || ev.Type || 'Untitled Event',
                start,
                end,
                description: ev.Description,
                fullname: ev.FullName,
                projectName: ev.ProjectName,
                priority: ev.Priority,
                CreatedBy: ev.CreatedBy,
                CreatedDate: ev.CreatedDate,
            };
        })
        .filter(Boolean) as CalendarEvent[];

export const getEventsForSelectedDate = (eventList: EventData[], selectedDate: Date): EventData[] => {
    const key = toLocalDateKey(selectedDate);

    return eventList.filter((ev) => {
        const dateValue =
            ev.Type?.toUpperCase() === 'TASK'
                ? ev.DeadlineDate?.slice(0, 10)
                : ev.Date?.slice(0, 10);

        return dateValue === key;
    });
};

export const getFilteredEventsForTab = (events: EventData[], tab: string): EventData[] =>
    events.filter((ev) => {
        if (tab === 'All') return true;
        if (tab === 'Conference') return ev.Type?.toUpperCase().includes('CONFERENCE');

        return ev.Type?.toUpperCase() === tab.toUpperCase();
    });

export const getTaskPriorityClassName = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
        case 'high':
            return 'text-[#F5222D]';
        case 'medium':
            return 'text-[#FA8C16]';
        case 'low':
            return 'text-[#52C96A]';
        default:
            return 'text-[#30323A]';
    }
};

export const getApiMessage = (
    messages: string[] | undefined,
    fallback: string,
): string => messages?.filter(Boolean).join(', ') || fallback;
