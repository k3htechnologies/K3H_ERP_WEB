import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Loader } from '@/core/utils/loader';
import { formatDate_MonthName_yy } from '@/core/utils/dateFormat';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { CALENDER_VIEW_TYPE } from '@/core/constants/staticData';
import { Button } from '@/ui/components/forms';
import { Plus } from 'lucide-react';
import Tabs from '@/ui/components/Tab/Tab';

/* ================= TYPES ================= */
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  textColor?: string;
}

/* ================= MOCK EVENTS ================= */
const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Task',
    start: '2026-02-01',
    backgroundColor: '#e0f2fe',
    textColor: '#2563eb'
  },
  {
    id: '2',
    title: 'Conference',
    start: '2026-02-01',
    backgroundColor: '#ffedd5',
    textColor: '#ea580c'
  },
  {
    id: '3',
    title: 'Meeting',
    start: '2026-02-01',
    backgroundColor: '#fee2e2',
    textColor: '#dc2626'
  },
  {
    id: '4',
    title: 'Task',
    start: '2026-02-09T10:00:00',
    end: '2026-02-09T12:30:00',
    backgroundColor: '#e0f2fe',
    textColor: '#2563eb'
  }
];

const Event: React.FC = () => {
  //#region STATE
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  //#endregion

  //#regionTAB ACTIVITY
  const eventTabList = [
    { id: "Task", label: "Task" },
    { id: "Meeting", label: "Meeting" },
    { id: "Conference Room", label: "Conference" },
  ];

  const [activeTab, setActiveTab] = useState<string>(eventTabList[0].id);

  //#endregion

  const calendarRef = useRef<FullCalendar | null>(null);

  /* ===== SINGLE SOURCE OF TRUTH ===== */
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [view, setView] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  >('dayGridMonth');

  /* ================= HELPERS ================= */

  const selectedDateStr = currentDate.toISOString().split('T')[0];

  const upcomingEvents = events.filter(ev =>
    ev.start.startsWith(selectedDateStr)
  );

  const getDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'All day';

    const diff = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 60) return `${mins} min`;

    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;

    return rem ? `${hrs}h ${rem}m` : `${hrs} hrs`;
  };

  /* ================= EVENTS ================= */

  // Mini calendar date select
  const handleDayPickerSelect = (date?: Date) => {
    if (!date) return;
    setCurrentDate(date);
    calendarRef.current?.getApi().gotoDate(date);
  };

  // View change
  const handleViewChange = (newView: typeof view) => {
    setView(newView);
    calendarRef.current?.getApi().changeView(newView);
  };

  // FullCalendar prev / next sync back
  const handleDatesSet = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    setCurrentDate(api.getDate());
  };

  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="bg-white p-4">

        <div className="space-y-10 p-6 bg-blue-50">
          {/* MINI CALENDAR */}
          <DayPicker
            mode="single"
            selected={currentDate}
            month={currentDate}
            onSelect={handleDayPickerSelect}
            onMonthChange={setCurrentDate}
          />
        </div>

        {/* UPCOMING EVENTS */}
        <div className="mt-6 border-t pt-4">
          <div className="text-sm font-semibold mb-3">
            {currentDate.toDateString()}
          </div>

          <div className="space-y-2">
            {upcomingEvents.length === 0 && (
              <div className="text-xs text-gray-400">
                No events for this day
              </div>
            )}

            {upcomingEvents.map(ev => (
              <div
                key={ev.id}
                className="flex justify-between items-center text-xs"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ev.backgroundColor }}
                  />
                  {ev.title}
                </span>

                <span className="text-gray-400">
                  {getDuration(ev.start, ev.end)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ================= RIGHT CONTENT ================= */}
      <div className="flex-1 p-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 gap-4">

          {/* LEFT : MONTH TITLE */}
          <h2 className="font-semibold text-blue-600 text-[22px] whitespace-nowrap">
            {formatDate_MonthName_yy(currentDate)}
          </h2>

          {/* RIGHT : ACTIONS */}
          <div className="flex items-center gap-3 flex-nowrap">

            {/* Tabs */}
            <div className="flex-shrink-0">
              <Tabs
                tabs={eventTabList}
                defaultActive={activeTab}
                islarge

              />
            </div>

            {/* View Selector */}
            <div className="min-w-[160px]">
              <SinglePageSelection
                required
                value={view}
                onChange={(val) =>handleViewChange(val as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay')}
                options={CALENDER_VIEW_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
              />
            </div>

            {/* Add Button */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              color="blue"
              size="mxs"
              variant="solid"
              colorMode="gradient_dark"
              defineWidth
              style={{ width: '125px' }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add
            </Button>

          </div>
        </div>


        {/* MAIN CALENDAR */}
        <div className="bg-white rounded-xl h-[85vh]">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            height="100%"
            dayMaxEvents={3}
            selectable
            editable
            nowIndicator
            datesSet={handleDatesSet}
          />
        </div>
      </div>
    </div>
  );
};

export default Event;
