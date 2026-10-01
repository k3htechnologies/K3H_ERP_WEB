import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { runApiWithLoader } from '@/core/utils';
import { formatDate_dd_MonthName_yy, convert_hh_mm_ss_to_hh_mm } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { ConferenceDayView } from '@/features/conference/components/ConferenceDayView';
import type {
  ConferenceDetailsData,
  ConferenceRoomData,
  ConferenceScheduleView,
  PullConferenceBookingDetailsRequest,
  PullConferenceDetailsRequest,
} from '@/features/conference/models/ConferenceModel';
import { conferenceService } from '@/features/conference/services/ConferenceService';
import {
  filterBookingsForDay,
  formatWeekDateRangeLabel,
  getRoomThemeMap,
  getScheduleDateRange,
  mapBookingsToCalendarEvents,
  shiftScheduleDate,
} from '@/features/conference/utils/conferenceUtils';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import CustomCalendar from '@/ui/components/Calender/CustomCalendar';
import { toLocalDateKey } from '@/ui/components/Calender/CalendarUtils';
import { Button } from '@/ui/components/forms';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import Tabs from '@/ui/components/Tab/Tab';

export const Conference: React.FC = () => {
  const scheduleViewTabList = [
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ];

  const [bookingList, setBookingList] = useState<ConferenceDetailsData[]>([]);
  const [rooms, setRooms] = useState<ConferenceRoomData[]>([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [scheduleView, setScheduleView] = useState<ConferenceScheduleView>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('/event');

  useEffect(() => {
    loadConferenceRooms();
  }, []);

  useEffect(() => {
    loadConferenceBookings(currentDate, scheduleView);
  }, [currentDate, scheduleView]);

  const loadConferenceRooms = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const roomParams: PullConferenceDetailsRequest = {
          PageSize: 100,
          PageNumber: 1,
          RoomId: 0,
        };
        const roomsResponse = await conferenceService.apiCallPullConferenceDetails(roomParams);

        if (E.isRight(roomsResponse)) {
          setRooms(roomsResponse.right.Data);
        } else {
          addToast({ type: 'error', title: roomsResponse.left.message });
        }

        return roomsResponse;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Conference Rooms',
    );
  };

  const loadConferenceBookings = async (date: Date, view: ConferenceScheduleView) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const { fromDate, toDate } = getScheduleDateRange(date, view);

        const bookingParams: PullConferenceBookingDetailsRequest = {
          PageNumber: 1,
          PageSize: 1000,
          StartDate: toLocalDateKey(fromDate),
          EndDate: toLocalDateKey(toDate),
        };

        const bookingsResponse =
          await conferenceService.apiCallPullConferenceBookingDetails(bookingParams);

        if (E.isRight(bookingsResponse)) {
          setBookingList(bookingsResponse.right.Data);
        } else {
          addToast({ type: 'error', title: bookingsResponse.left.message });
        }

        return bookingsResponse;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Conference',
    );
  };

  const calendarEvents = useMemo(
    () => mapBookingsToCalendarEvents(bookingList),
    [bookingList],
  );

  const dayBookings = useMemo(
    () => filterBookingsForDay(bookingList, currentDate),
    [bookingList, currentDate],
  );

  const dayThemeByRoomId = useMemo(() => getRoomThemeMap(rooms), [rooms]);

  const handlePrevious = () => {
    setCurrentDate((current) => shiftScheduleDate(current, scheduleView, -1));
  };

  const handleNext = () => {
    setCurrentDate((current) => shiftScheduleDate(current, scheduleView, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    const [year, month, day] = event.start.split('T')[0].split('-').map(Number);
    setCurrentDate(new Date(year, month - 1, day));
    setScheduleView('day');
  };

  const handleBookRoom = (roomId: number) => {
    navigate('/conference/add', { state: { roomId } });
  };

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Conference Rooms</h2>
        </div>

        {rooms.length === 0 ? (
          <NoDataView message="No Conference Rooms Found" />
        ) : (
          <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {rooms.map((room) => (
              <div
                key={room.ConferenceRoomId}
                className="w-[210px] shrink-0 rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm"
              >
                <img
                  src={room.ImageUrl}
                  alt={room.RoomName}
                  className="h-[92px] w-full rounded-lg object-cover"
                />
                <h3
                  className="mt-3 truncate text-sm font-medium text-gray-900"
                  title={room.RoomName}
                >
                  {room.RoomName}
                </h3>
                <p className="mt-2 text-xs text-gray-500">
                  Capacity {room.Capacity} people • Booking{' '}
                  {room.TotalBookingCount}
                </p>
                {canAction && (
                  <div className="mt-3 flex items-center justify-center">
                    <Button
                      color="blue"
                      size="sm"
                      className="w-full"
                      onClick={() => handleBookRoom(room.ConferenceRoomId)}
                    >
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Scheduled Appointments
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Button onClick={handlePrevious} color="transparent">
                  <ChevronLeft className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                </Button>

                <h3 className="min-w-[140px] text-center text-lg font-medium text-blue-500 sm:min-w-[180px] sm:text-xl lg:min-w-[240px] lg:text-[22px]">
                  {scheduleView === 'day'
                    ? formatDate_dd_MonthName_yy(currentDate)
                    : formatWeekDateRangeLabel(currentDate)}
                </h3>

                <Button onClick={handleNext} color="transparent">
                  <ChevronRight className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                </Button>
              </div>

              <Tabs
                tabs={scheduleViewTabList}
                defaultActive={scheduleView}
                istoggleTab
                onTabChange={(tab) => setScheduleView(tab.id as ConferenceScheduleView)}
              />
            </div>
          </div>

          {scheduleView === 'week' ? (
            <div className="thin-scroll min-h-[420px] overflow-y-auto p-3">
              <CustomCalendar
                view="week"
                currentDate={currentDate}
                events={calendarEvents}
                onDateChange={setCurrentDate}
                onEventClick={handleEventClick}
                renderWeekSlotEvents={({ slotEvents, onEventClick }) =>
                  slotEvents.map((event) => {
                    const startTime = event.start?.includes('T')
                      ? convert_hh_mm_ss_to_hh_mm(event.start.split('T')[1])
                      : '';
                    const endTime = event.end?.includes('T')
                      ? convert_hh_mm_ss_to_hh_mm(event.end.split('T')[1])
                      : '';
                    const timeLabel = [startTime, endTime].filter(Boolean).join(' - ');
                    const subtitle = event.room?.trim() || event.fullname?.trim() || '';

                    return (
                      <div
                        key={event.id}
                        className="w-full rounded border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-emerald-50 p-1.5 mb-1 cursor-pointer transition hover:shadow-sm text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {timeLabel ? (
                          <div className="truncate text-[10px] font-medium text-emerald-700">
                            {timeLabel}
                          </div>
                        ) : null}
                        <div className="truncate text-xs font-semibold leading-tight text-gray-900">
                          {event.title}
                        </div>
                        {subtitle ? (
                          <div className="truncate text-[10px] text-gray-500 mt-0.5">
                            {subtitle}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                }
              />
            </div>
          ) : (
            <ConferenceDayView
              rooms={rooms}
              dayBookings={dayBookings}
              dayThemeByRoomId={dayThemeByRoomId}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default Conference;
