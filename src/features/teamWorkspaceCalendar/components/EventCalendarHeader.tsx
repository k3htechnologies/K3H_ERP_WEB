import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { formatDate_dd_MonthName_yy, formatDate_MonthName_yy } from '@/core/utils/dateFormat'
import { Button } from '@/ui/components/forms'
import Tabs from '@/ui/components/Tab/Tab'
import { getWeekDays } from '@/ui/components/Calender/CalendarUtils'
import type { CalendarView } from '@/ui/components/Calender/CustomCalendar'

interface EventCalendarHeaderProps {
  currentDate: Date
  activeTab: string
  view: CalendarView
  canAction: boolean
  onTabChange: (tabId: string) => void
  onViewChange: (view: CalendarView) => void
  onPrevious: () => void
  onNext: () => void
  onAddConference: () => void
  onAddMeeting: () => void
  onAddTask: () => void
}

export const EventCalendarHeader = ({
  currentDate,
  activeTab,
  view,
  canAction,
  onTabChange,
  onViewChange,
  onPrevious,
  onNext,
  onAddConference,
  onAddMeeting,
  onAddTask,
}: EventCalendarHeaderProps) => {
  const calendarViewTabList = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ]

  const eventTypeTabList = [
    { id: 'All', label: 'All' },
    { id: 'TASK', label: 'Task' },
    { id: 'MEETING', label: 'Meeting' },
    { id: 'CONFERENCE', label: 'Conference' },
  ]

  const [showAddMenu, setShowAddMenu] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!addMenuRef.current?.contains(event.target as Node)) {
        setShowAddMenu(false)
      }
    }

    if (showAddMenu) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showAddMenu])

  let dateLabel = formatDate_MonthName_yy(currentDate)

  if (view === 'day') {
    dateLabel = formatDate_dd_MonthName_yy(currentDate)
  } else if (view === 'week') {
    const weekDays = getWeekDays(currentDate)
    dateLabel = `${formatDate_dd_MonthName_yy(weekDays[0])} - ${formatDate_dd_MonthName_yy(weekDays[weekDays.length - 1])}`
  }

  const handleAddOption = (action: () => void) => {
    setShowAddMenu(false)
    action()
  }

  return (
    <div className="relative z-20 mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            onClick={onPrevious}
            color="transparent"
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          </Button>

          <h2 className="min-w-[140px] text-center text-lg font-medium text-blue-500 sm:min-w-[180px] sm:text-xl lg:min-w-[240px] lg:text-[22px]">
            {dateLabel}
          </h2>

          <Button
            onClick={onNext}
            color="transparent"
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-3">
          <Tabs
            tabs={calendarViewTabList}
            defaultActive={view}
            islarge={true}
            istoggleTab={true}
            onTabChange={(tab) => onViewChange(tab.id as CalendarView)}
          />

          {canAction && (
            <div ref={addMenuRef} className="relative">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowAddMenu((open) => !open)
                }}
                color="blue"
                size="mxs"
                variant="solid"
                colorMode="gradient_dark"
                defineWidth
                title="Add"
                aria-label="Add"
                style={{ width: '95px' }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                <span>Add</span>
              </Button>

              {showAddMenu && (
                <div className="absolute right-0 z-[100] mt-2 flex w-[150px] flex-col rounded-md border border-gray-200 bg-white shadow-lg">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddOption(onAddConference)
                    }}
                    color="transparent"
                    fullWidth
                    isborderRadius
                    size="sm"
                    title="Conference"
                    style={{ justifyContent: 'left' }}
                  >
                    Conference
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddOption(onAddMeeting)
                    }}
                    color="transparent"
                    fullWidth
                    isborderRadius
                    size="sm"
                    title="Meeting"
                    style={{ justifyContent: 'left' }}
                  >
                    Meeting
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddOption(onAddTask)
                    }}
                    color="transparent"
                    fullWidth
                    isborderRadius
                    size="sm"
                    title="Task"
                    style={{ justifyContent: 'left' }}
                  >
                    Task
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <Tabs
          tabs={eventTypeTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(tab) => onTabChange(tab.id)}
        />
      </div>
    </div>
  )
}
