import React from 'react';
import { convert_hh_mm_ss_to_hh_mm, formatHourTo12Hour } from '@/core/utils/dateFormat';
import {
  DAY_CARD_THEMES,
  DAY_HOURS,
  DAY_HOUR_HEIGHT,
  DAY_START_HOUR,
} from '@/features/conference/constants/conferenceConstants';
import type {
  ConferenceDetailsData,
  ConferenceRoomData,
  DayCardTheme,
} from '@/features/conference/models/ConferenceModel';
import { getDayBookingPosition } from '@/features/conference/utils/conferenceUtils';

interface Props {
  rooms: ConferenceRoomData[];
  dayBookings: ConferenceDetailsData[];
  dayThemeByRoomId: Map<number, DayCardTheme>;
}

export const ConferenceDayView: React.FC<Props> = ({
  rooms,
  dayBookings,
  dayThemeByRoomId,
}) => {
  return (
    <div className="thin-scroll max-h-[70vh] min-h-[420px] overflow-auto">
      {rooms.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
          No conference rooms available
        </div>
      ) : (
        <div className="thin-scroll overflow-x-auto">
          <div className="min-w-[988px]">
            <div className="sticky top-0 z-20 grid grid-cols-[88px_repeat(5,minmax(180px,1fr))] border-b border-gray-200 bg-[#F8FAFC]">
              <div className="border-r border-gray-200" />
              {rooms.map((room) => (
                <div
                  key={room.ConferenceRoomId}
                  className="border-r border-gray-200 px-3 py-3 last:border-r-0"
                >
                  <div
                    className="truncate text-sm font-semibold text-gray-800"
                    title={room.RoomName}
                  >
                    {room.RoomName}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    ({room.Capacity} people)
                  </div>
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-[88px_repeat(5,minmax(180px,1fr))] h-[864px]">
              <div className="relative border-r border-gray-200 bg-white">
                {DAY_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute right-2 -translate-y-1/2 text-xs text-gray-400"
                    style={{ top: (hour - DAY_START_HOUR) * DAY_HOUR_HEIGHT }}
                  >
                    {formatHourTo12Hour(hour)}
                  </div>
                ))}
              </div>

              {rooms.map((room) => {
                const roomBookings = dayBookings.filter(
                  (booking) => booking.RoomId === room.ConferenceRoomId,
                );
                const theme =
                  dayThemeByRoomId.get(room.ConferenceRoomId) ?? DAY_CARD_THEMES[0];

                return (
                  <div
                    key={room.ConferenceRoomId}
                    className="relative border-r border-gray-200 last:border-r-0"
                  >
                    {DAY_HOURS.map((hour) => (
                      <div
                        key={`${room.ConferenceRoomId}-${hour}`}
                        className="absolute left-0 right-0 border-t border-gray-100 h-[72px]"
                        style={{
                          top: (hour - DAY_START_HOUR) * DAY_HOUR_HEIGHT,
                        }}
                      />
                    ))}

                    {roomBookings.map((booking) => {
                      const position = getDayBookingPosition(
                        booking.StartTime,
                        booking.EndTime,
                      );
                      if (!position) return null;

                      const roomName = booking.RoomName?.trim();

                      return (
                        <div
                          key={booking.ConferenceRoomBookingId}
                          className={`absolute left-2 right-2 z-10 overflow-hidden rounded-lg border text-left shadow-sm border-l-[5px] ${theme.bgClass} ${theme.borderClass}`}
                          style={{
                            top: position.top,
                            height: position.height,
                          }}
                        >
                          <div className="flex h-full flex-col gap-0.5 overflow-hidden px-2.5 py-1.5">
                            <div
                              className={`shrink-0 truncate text-xs font-medium ${theme.timeClass}`}
                            >
                              {[convert_hh_mm_ss_to_hh_mm(booking.StartTime), convert_hh_mm_ss_to_hh_mm(booking.EndTime)]
                                .filter(Boolean)
                                .join(' - ')}
                            </div>
                            <div className="shrink-0 truncate text-sm font-semibold text-gray-900">
                              {booking.ConferenceTitle}
                            </div>
                            {roomName ? (
                              <div className="shrink-0 truncate text-xs text-gray-500">
                                {roomName}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceDayView;
