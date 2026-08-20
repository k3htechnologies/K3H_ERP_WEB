import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as E from 'fp-ts/Either'
import { getMonthDateRange } from '@/core/utils/comman'
import { runApiWithLoader } from '@/core/utils'
import { Loader } from '@/core/utils/loader'
import useToast from '@/core/hooks/useToast'
import { ConferenceRoomView } from '@/features/event/conference/components/ConferenceRoomView'
import { EventModuleTabs } from '@/features/event/event/components/EventModuleTabs'
import { CONFERENCE_EVENT_TYPE, type ConferenceScheduleView } from '@/features/event/conference/constants/conferenceConstants'
import type { EventData, FilterWithPaginationEventRequest } from '@/features/event/event/models/EventModel'
import { EventService } from '@/features/event/event/services/EventService'
import { buildCalendarEvents } from '@/features/event/event/utils/eventUtils'
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent'
import { ViewEventModal } from '@/features/event/event/components/ViewEventModal'

const Conference: React.FC = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [conferenceList, setConferenceList] = useState<EventData[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduleView, setScheduleView] = useState<ConferenceScheduleView>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isViewOpen, setIsViewOpen] = useState(false)

  const loadConferences = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const { fromDate, toDate } = getMonthDateRange(currentDate)
        const params: FilterWithPaginationEventRequest = {
          EventId: 0,
          FromDate: fromDate.toISOString(),
          ToDate: toDate.toISOString(),
          Type: CONFERENCE_EVENT_TYPE,
        }
        const response = await EventService.apiCallPullEvent(params)
        if (E.isRight(response)) {
          setConferenceList(response.right.Data)
        } else {
          addToast({ type: 'error', title: response.left.message })
        }
        return response
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: (error as Error).message }),
      undefined,
      'Loading Conference',
    )
  }, [addToast, currentDate])

  useEffect(() => {
    void loadConferences()
  }, [loadConferences])

  const calendarEvents = useMemo(() => buildCalendarEvents(conferenceList), [conferenceList])

  const handleBookRoom = (roomName: string) => {
    navigate(`/conference/add?room=${encodeURIComponent(roomName)}`)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setCurrentDate(new Date(event.start))
    setIsViewOpen(true)
  }

  const handleViewTabChange = (tabId: string) => {
    setIsViewOpen(false)
    if (tabId === 'All') {
      navigate('/event')
      return
    }
    if (tabId === 'Task') {
      navigate('/task')
      return
    }
    if (tabId === 'Meeting') {
      navigate('/meeting')
      return
    }
    if (tabId === 'Conference') {
      navigate('/conference')
    }
  }

  return (
    <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm lg:h-[calc(100dvh-78px)] lg:min-h-[640px]">
      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>
      <div className="border-b border-gray-200 px-4 pt-4 sm:px-5">
        <EventModuleTabs activeTab="Conference" />
      </div>
      <ConferenceRoomView
        currentDate={currentDate}
        events={calendarEvents}
        eventList={conferenceList}
        scheduleView={scheduleView}
        onScheduleViewChange={setScheduleView}
        onDateChange={setCurrentDate}
        onBookRoom={handleBookRoom}
        onEventClick={handleEventClick}
      />
      <ViewEventModal
        isOpen={isViewOpen}
        isLoading={isLoading}
        currentDate={currentDate}
        viewActiveTab="Conference"
        events={conferenceList}
        onClose={() => setIsViewOpen(false)}
        onTabChange={handleViewTabChange}
        onSubmit={() => undefined}
      />
    </div>
  )
}

export default Conference
