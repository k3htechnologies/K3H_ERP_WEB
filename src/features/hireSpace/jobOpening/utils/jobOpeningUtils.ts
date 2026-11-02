import { EXPERIENCE_RANGE_OPTIONS } from '@/core/constants';
import type { InterviewCalendarView } from '@/features/hireSpace/jobOpening/components/InterviewCalendar';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import { getWeekDays } from '@/ui/components/Calender/CalendarUtils';

export const getEventTime = (event: CalendarEvent) => event.start.slice(11, 16);

const getExperienceRangeCeiling = (name: string): number => {
  if (name.endsWith('+')) return Number(name.slice(0, -1)) + 1;
  const parts = name.split('-');
  return Number(parts[parts.length - 1]);
};

export const getExperienceRangeValue = (years?: number | null): string => {
  if (years == null || years <= 0) return '';

  const match = EXPERIENCE_RANGE_OPTIONS.find((opt) => years <= getExperienceRangeCeiling(opt.name));
  return match?.id ?? EXPERIENCE_RANGE_OPTIONS[EXPERIENCE_RANGE_OPTIONS.length - 1].id;
};

export const getExperienceRangeLabel = (years?: number | null): string => {
  const value = getExperienceRangeValue(years);
  if (!value) return '-';

  return EXPERIENCE_RANGE_OPTIONS.find((opt) => opt.id === value)?.name ?? '-';
};

export const getExperienceYearsFromRange = (rangeId: string): number => {
  const option = EXPERIENCE_RANGE_OPTIONS.find((opt) => opt.id === rangeId);
  return option ? getExperienceRangeCeiling(option.name) : 0;
};

export const getCalendarViewDateRange = (date: Date, view: InterviewCalendarView) => {
  if (view === 'day') return { startDate: date, endDate: date };

  if (view === 'week') {
    const weekDays = getWeekDays(date);
    return { startDate: weekDays[0], endDate: weekDays[6] };
  }

  return {
    startDate: new Date(date.getFullYear(), date.getMonth(), 1),
    endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
};

export const parseSkills = (skills?: string | string[] | null): string[] => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  if (!skills?.trim()) return [];

  return skills
    .split(/[,\s]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};
