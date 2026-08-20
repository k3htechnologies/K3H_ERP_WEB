import React from 'react'
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat'
import type { EventData } from '@/features/event/event/models/EventModel'
import { EVENT_TAB_LIST } from '@/features/event/event/constants/eventConstants'
import { Modal } from '@/ui/components/Modal/Modal'
import { FieldItem } from '@/ui/components/forms/FieldItem'
import Tabs from '@/ui/components/Tab/Tab'
import NoDataView from '@/ui/components/NoDataView/NoDataView'

interface ViewEventModalProps {
  isOpen: boolean
  isLoading: boolean
  currentDate: Date
  viewActiveTab: string
  events: EventData[]
  onClose: () => void
  onTabChange: (tabId: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export const ViewEventModal = React.memo<ViewEventModalProps>(({
  isOpen,
  isLoading,
  currentDate,
  viewActiveTab,
  events,
  onClose,
  onTabChange,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    onCancel={onClose}
    title={formatDate_dd_MonthName_yy(currentDate.toISOString().slice(0, 10))}
    onSubmit={onSubmit}
    loading={isLoading}
    size="xxl"
  >
    <div className="space-y-3">
      <Tabs
        tabs={EVENT_TAB_LIST}
        defaultActive={viewActiveTab === '' ? '' : viewActiveTab}
        islarge
        onTabChange={(tab) => onTabChange(tab.id)}
      />

      {events.length === 0 && (
        <div className="text-xs text-gray-400">
          <NoDataView message="No events for this day" />
        </div>
      )}

      {events.map((ev) => (
        <div
          key={ev.EventId}
          className="text-xs p-3 rounded-lg bg-gray-100"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <span
                className={`h-2 w-2 rounded-full ${
                  ev.Type?.toUpperCase() === 'TASK'
                    ? 'bg-blue-600'
                    : ev.Type?.toUpperCase() === 'MEETING'
                      ? 'bg-red-500'
                      : 'bg-orange-500'
                }`}
              />
              {ev.Title}
            </span>

            {ev.Type?.toUpperCase() === 'TASK' ? (
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Deadline : {formatDate_dd_MonthName_yy(ev.DeadlineDate || '-')}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Date : {formatDate_dd_MonthName_yy(ev.Date || '-')}
              </span>
            )}
          </div>

          <div className="pb-2">
            {ev.Description?.trim() || '-'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {ev.FullName && (
                  <div className="grid w-full grid-cols-[180px_16px_1fr] items-start gap-2">
                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                      {ev.Type}  Member
                    </div>
                    <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>
                    <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
                      <ul className="list-disc ml-4 text-[11px]">
                        {ev.FullName.split(',').map((name) => name.trim()).filter((name) => name !== '')
                          .map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
                {ev.ProjectName && (
                  <div className="grid w-full grid-cols-[180px_16px_1fr] items-start gap-2">
                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                      Project Name
                    </div>
                    <div className="text-sm text-[#1D1D1D80] text-center select-none">:</div>
                    <div className="text-sm text-[#1D1D1D] font-medium break-words min-w-0">
                      <ul className="list-disc ml-4 text-[11px]">
                        {ev.ProjectName.split(',').map((name) => name.trim()).filter((name) => name !== '')
                          .map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldItem label={`${ev.Type} Assigned By`} isRow value={ev.CreatedBy} />
              <FieldItem label={`${ev.Type}  Assigned Date`} isRow value={formatDate_dd_MonthName_yy_hh_mm(ev.CreatedDate ?? '-')} />
              {ev.Type !== 'Task' ? (
                <FieldItem label={`${ev.Type} Time`} isRow value={ev.StartTime + '- ' + ev.EndTime} />
              ) : ''}
            </div>
            {ev.DocumentURL && (
              <FieldItem
                label=""
                value="Document"
                urls={ev.DocumentURL}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  </Modal>
))

ViewEventModal.displayName = 'ViewEventModal'
