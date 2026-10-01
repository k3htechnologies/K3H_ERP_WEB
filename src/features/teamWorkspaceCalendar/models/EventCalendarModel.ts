import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent'

export interface SidebarSection {
    key: string
    label: string
    tone: string
    events: CalendarEvent[]
}

export interface GroupedCalendarEvent {
    type: string
    label: string
    firstEvent: CalendarEvent
}
