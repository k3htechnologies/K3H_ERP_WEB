import { getWeekDays, toLocalDateKey } from '@/ui/components/Calender/CalendarUtils';
import {
  DAY_CARD_THEMES,
  DAY_END_HOUR,
  DAY_HOUR_HEIGHT,
  DAY_START_HOUR,
} from '@/features/conference/constants/conferenceConstants';
import type {
  ConferenceDetailsData,
  ConferenceRoomData,
  ConferenceScheduleView,
  DayCardTheme,
} from '@/features/conference/models/ConferenceModel';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';

export const toDayMinutes = (time?: string): number | null => {
  if (!time) return null;
  const [hours, minutes] = time.split(':');
  const hourNum = Number(hours);
  const minuteNum = Number(minutes);
  if (Number.isNaN(hourNum) || Number.isNaN(minuteNum)) return null;
  return hourNum * 60 + minuteNum;
};

export const getScheduleDateRange = (
  date: Date,
  view: ConferenceScheduleView,
): { fromDate: Date; toDate: Date } => {
  if (view === 'day') {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return { fromDate: day, toDate: day };
  }

  const weekDays = getWeekDays(date);
  const fromDate = new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), weekDays[0].getDate());
  const toDate = new Date(weekDays[6].getFullYear(), weekDays[6].getMonth(), weekDays[6].getDate());

  return { fromDate, toDate };
};

export const mapBookingsToCalendarEvents = (
  bookingList: ConferenceDetailsData[],
): CalendarEvent[] =>
  bookingList
    .map((booking) => {
      if (!booking.MeetingDate || !booking.StartTime) return null;

      const dateKey = booking.MeetingDate.split('T')[0];

      return {
        id: booking.ConferenceRoomBookingId,
        type: 'CONFERENCE' as const,
        color: 'green' as const,
        title: booking.ConferenceTitle,
        start: `${dateKey}T${booking.StartTime}`,
        end: booking.EndTime ? `${dateKey}T${booking.EndTime}` : undefined,
        room: booking.RoomName,
        fullname: booking.RoomName,
        CreatedDate: booking.CreatedDate,
      };
    })
    .filter(Boolean) as CalendarEvent[];

export const getRoomThemeMap = (rooms: ConferenceRoomData[]): Map<number, DayCardTheme> => {
  const map = new Map<number, DayCardTheme>();
  rooms.forEach((room, index) => {
    map.set(room.ConferenceRoomId, DAY_CARD_THEMES[index % DAY_CARD_THEMES.length]);
  });
  return map;
};

export const filterBookingsForDay = (
  bookingList: ConferenceDetailsData[],
  date: Date,
): ConferenceDetailsData[] => {
  const dayDateKey = toLocalDateKey(date);
  return bookingList.filter(
    (booking) =>
      booking.MeetingDate &&
      booking.StartTime &&
      booking.MeetingDate.split('T')[0] === dayDateKey,
  );
};

export const getDayBookingPosition = (
  startTime?: string,
  endTime?: string,
): { top: number; height: number } | null => {
  const startMinutes = toDayMinutes(startTime);
  if (startMinutes == null) return null;

  const rawEndMinutes = toDayMinutes(endTime);
  const endMinutes =
    rawEndMinutes != null && rawEndMinutes > startMinutes
      ? rawEndMinutes
      : startMinutes + 30;

  const viewStart = DAY_START_HOUR * 60;
  const viewEnd = DAY_END_HOUR * 60;
  if (endMinutes <= viewStart || startMinutes >= viewEnd) return null;

  const clampedStart = Math.max(startMinutes, viewStart);
  const clampedEnd = Math.min(endMinutes, viewEnd);

  return {
    top: ((clampedStart - viewStart) / 60) * DAY_HOUR_HEIGHT + 4,
    height: Math.max(((clampedEnd - clampedStart) / 60) * DAY_HOUR_HEIGHT - 8, 44),
  };
};

export const formatWeekDateRangeLabel = (date: Date): string => {
  const weekDays = getWeekDays(date);
  const start = weekDays[0];
  const end = weekDays[6];

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getDate()} ${startMonth} ${start.getFullYear()} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  }
  if (startMonth !== endMonth) {
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${start.getFullYear()}`;
  }
  return `${start.getDate()} - ${end.getDate()} ${startMonth} ${start.getFullYear()}`;
};

export const shiftScheduleDate = (
  currentDate: Date,
  view: ConferenceScheduleView,
  direction: -1 | 1,
): Date => {
  const nextDate = new Date(currentDate);
  const daysToShift = view === 'week' ? 7 * direction : direction;
  nextDate.setDate(nextDate.getDate() + daysToShift);
  return nextDate;
};
