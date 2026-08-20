import React from 'react'
import { ChevronLeft, ChevronRight, DoorOpen } from 'lucide-react'
import { CONFERENCE_ROOM_NAME } from '@/core/constants'
import CustomCalendar from '@/ui/components/Calender/CustomCalendar'
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent'
import { Button } from '@/ui/components/forms'
import Tabs from '@/ui/components/Tab/Tab'
import type { EventData } from '@/features/event/event/models/EventModel'
import type { ConferenceScheduleView } from '@/features/event/conference/constants/conferenceConstants'

interface ConferenceRoomViewProps {
  currentDate: Date
  events: CalendarEvent[]
  eventList: EventData[]
  scheduleView: ConferenceScheduleView
  onScheduleViewChange: (view: ConferenceScheduleView) => void
  onDateChange: (date: Date) => void
  onBookRoom: (roomName: string) => void
  onEventClick: (event: CalendarEvent) => void
}

export const ConferenceRoomView: React.FC<ConferenceRoomViewProps> = ({
  currentDate,
  events,
  eventList,
  scheduleView,
  onScheduleViewChange,
  onDateChange,
  onBookRoom,
  onEventClick,
}) => {
  const changeDate = (direction: number) => {
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + direction * (scheduleView === 'month' ? 7 : 1))
    onDateChange(nextDate)
  }

  const bookingCount = (roomId: string, roomName: string) =>
    eventList.filter((event) => {
      const eventRoom = event.Room?.trim().toLowerCase()
      return eventRoom === roomId.toLowerCase() || eventRoom === roomName.toLowerCase()
    }).length

  return (
    <div className="flex min-h-full flex-col gap-5 rounded-xl bg-[#F6F7F9] p-4 sm:p-5">
      <section className="rounded-xl border border-[#E8EBF0] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#202B3C]">Conference Rooms</h2>
          <Tabs
            tabs={[{ id: 'month', label: 'Month' }, { id: 'day', label: 'Day' }]}
            activeTab={scheduleView}
            isCalendarTabs
            ariaLabel="Conference schedule view"
            onTabChange={(tab) => onScheduleViewChange(tab.id as ConferenceScheduleView)}
          />
        </div>

        <div className="thin-scroll grid grid-flow-col auto-cols-[minmax(210px,1fr)] gap-3 overflow-x-auto pb-1 xl:grid-flow-row xl:grid-cols-3">
          {CONFERENCE_ROOM_NAME.map((room) => (
            <article key={room.id} className="rounded-lg border border-[#E6EAF0] bg-white p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
              <div className="flex h-[92px] items-center justify-center rounded-lg bg-gradient-to-br from-[#EAF1FF] to-[#F7F9FC] text-[#2F6FED]">
                <DoorOpen className="h-9 w-9" aria-hidden="true" />
              </div>
              <h3 className="mt-3 truncate text-xs font-medium text-[#1F2A3D]" title={room.name}>{room.name}</h3>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8591A5]">
                <span>Booking {bookingCount(String(room.id), room.name)}</span>
              </div>
              <div className="mt-3">
                <Button color="blue" variant="outline" size="sm" fullWidth onClick={() => onBookRoom(String(room.id))}>
                  Book Now
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-xl border border-[#E8EBF0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF0F4] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#202B3C]">Scheduled Appointments</h2>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-[#DFE4EB] px-3 py-2 text-[11px] text-[#657084]">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="rounded-md border border-[#DFE4EB]">
              <Button color="transparent" size="xs" defineWidth isborderRadius aria-label="Previous schedule" onClick={() => changeDate(-1)}>
                <ChevronLeft />
              </Button>
            </div>
            <div className="rounded-md border border-[#DFE4EB]">
              <Button color="transparent" size="xs" defineWidth isborderRadius aria-label="Next schedule" onClick={() => changeDate(1)}>
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-auto p-3">
          <CustomCalendar view={scheduleView === 'month' ? 'week' : 'day'} currentDate={currentDate} events={events} onDateChange={onDateChange} onEventClick={onEventClick} />
        </div>
      </section>
    </div>
  )
}
