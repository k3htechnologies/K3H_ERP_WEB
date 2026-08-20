import React from 'react'
import { Plus } from 'lucide-react'
import { formatDate_MonthName_yy } from '@/core/utils/dateFormat'
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection'
import { Button } from '@/ui/components/forms'
import Tabs from '@/ui/components/Tab/Tab'
import {
  CALENDAR_VIEW_OPTIONS,
  EVENT_TAB_LIST,
  type CalendarView,
} from '@/features/event/event/constants/eventConstants'

interface EventCalendarHeaderProps {
  currentDate: Date
  activeTab: string
  view: CalendarView
  onTabChange: (tabId: string) => void
  onViewChange: (view: CalendarView) => void
  onAdd: () => void
}

export const EventCalendarHeader = React.memo<EventCalendarHeaderProps>(({
  currentDate,
  activeTab,
  view,
  onTabChange,
  onViewChange,
  onAdd,
}) => (
  <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <h1 className="shrink-0 text-[28px] font-semibold leading-9 tracking-[-0.5px] text-[#202229]">
        {formatDate_MonthName_yy(currentDate)}
      </h1>
      <Tabs
        tabs={EVENT_TAB_LIST}
        activeTab={activeTab}
        isCalendarTabs
        ariaLabel="Event type"
        onTabChange={(tab) => onTabChange(tab.id)}
      />
    </div>

    <div className="flex items-center gap-3 self-end xl:self-auto">
      <div className="w-[104px]">
        <SinglePageSelection
          value={view}
          size="sm"
          searchable={false}
          isShowClearSelection={false}
          onChange={(val) => onViewChange(val as CalendarView)}
          options={CALENDAR_VIEW_OPTIONS.map((opt) => ({
            label: opt.name,
            value: opt.id,
          }))}
        />
      </div>

      <div className="w-[104px]">
        <Button
          leftIcon={<Plus />}
          color="blue"
          size="sm"
          colorMode="gradient_dark"
          fullWidth
          onClick={onAdd}
        >
          Add
        </Button>
      </div>
    </div>
  </div>
))

EventCalendarHeader.displayName = 'EventCalendarHeader'
