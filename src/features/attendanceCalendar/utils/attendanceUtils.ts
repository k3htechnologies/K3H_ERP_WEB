export const STATUS_CONFIG = {
  PRESENT: { color: '#16A24A', text: '#16A24A', badge: { backgroundColor: '#16A24A', color: '#16A24A' } },
  ABSENT: { color: '#ff2828', text: '#ff2828', badge: { backgroundColor: '#ff2828', color: '#ff2828' } },
  LEAVE: { color: '#DB0073', text: '#DB0073', badge: { backgroundColor: '#DB0073', color: '#DB0073' } },
  HOLIDAY: { color: '#9200EA', text: '#9200EA', badge: { backgroundColor: '#9200EA', color: '#9200EA' } },
  LATE: { color: '#EA5800', text: '#EA5800', badge: { backgroundColor: '#EA5800', color: '#EA5800' } },
  HALF_DAY: { color: '#008EB1', text: '#008EB1', badge: { backgroundColor: '#008EB1', color: '#008EB1' } },
  WEEK_OFF: { color: '#3F5067', text: '#3F5067', badge: { backgroundColor: '#3F5067', color: '#3F5067' } },
  EARLY_LEAVE: { color: '#FFC569', text: '#FFC569', badge: { backgroundColor: '#FFC569', color: '#FFC569' } },
  COMP_OFF: { color: '#5149e5', text: '#5149e5', badge: { backgroundColor: '#5149e5', color: '#5149e5' } },
  CHECKOUT_MISSING: { color: '#923b54', text: '#923b54', badge: { backgroundColor: '#923b54', color: '#923b54', } },
  DEFAULT: { color: '', text: '', badge: { backgroundColor: '', color: '' } },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

/* ================= NORMALIZATION ================= */

export const normalizeStatus = (status?: string): string =>
  status?.toUpperCase().replace(/[\s-]+/g, '_') ?? '';

/* ================= STATUS RESOLUTION ================= */

const PARTIAL_STATUS_MAP: [StatusKey, RegExp][] = [
  ['LATE', /LATE/],
  ['HALF_DAY', /HALF.*DAY/],
  ['WEEK_OFF', /WEEK/],
  ['EARLY_LEAVE', /EARLY/],
  ['COMP_OFF', /COMP/],
  ['CHECKOUT_MISSING', /CHECKOUT|MISSING/],
];

const resolveStatus = (status?: string): StatusKey => {
  const normalized = normalizeStatus(status);
  if (normalized in STATUS_CONFIG) return normalized as StatusKey;

  for (const [key, pattern] of PARTIAL_STATUS_MAP) {
    if (pattern.test(normalized)) return key;
  }

  return 'DEFAULT';
};

/* ================= STATUS HELPERS ================= */

export const getStatusColor = (status?: string): string =>
  STATUS_CONFIG[resolveStatus(status)].color;

export const getStatusTextColor = (status?: string): string =>
  STATUS_CONFIG[resolveStatus(status)].text;

export const getStatusBadgeClasses = (status?: string): { backgroundColor: string; color: string } =>
  STATUS_CONFIG[resolveStatus(status)].badge;

export const getStatusLabel = (status?: string | null): string => {
  if (!status) return '-';
  const trimmed = String(status).trim();
  if (!trimmed) return '-';

  const normalized = trimmed.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();

  return normalized
    .split(' ')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
};

/* ================= DATE UTILITIES ================= */

export const parseMMDDYYYY = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split(/[\/\s]/);
  if (!month || !day || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const convertToISO = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  
  // If already in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    // If it already has time part, return as is (or ensure it has time)
    if (dateStr.includes('T')) {
      // Already has time, return as is
      return dateStr;
    } else {
      // Just date part, add default time
      return `${dateStr}T00:00:00`;
    }
  }
  
  // Try parsing as MM/DD/YYYY format
  const [date, time = '00:00'] = dateStr.split(' ');
  const parsed = parseMMDDYYYY(date);
  if (!parsed) return null;
  const [h = '00', m = '00'] = time.split(':');
  return `${parsed}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
};

export const buildEventDateTime = (
  date?: string | null,
  time?: string | null
): string | null => {
  if (!date) return null;
  
  // If already in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
    // If it already has time part, return as is
    if (date.includes('T')) {
      return date;
    } else {
      // Just date part, add time if provided
      return time ? `${date}T${time}:00` : `${date}T00:00:00`;
    }
  }
  
  // Try parsing as MM/DD/YYYY format
  const parsed = parseMMDDYYYY(date);
  return parsed ? (time ? `${parsed}T${time}:00` : parsed) : null;
};

export const getLocalDateString = (date: Date): string =>
  date.toISOString().split('T')[0];

/* ================= FILTER UTILITIES ================= */

export const matchesFilter = (
  eventType: string | undefined,
  filterTab: string
): boolean => {
  if (!filterTab || filterTab === 'All') return true;
  if (!eventType) return false;

  return resolveStatus(eventType) === resolveStatus(filterTab);
};

/* ================= TIME PARSING UTILITIES ================= */

/**
 * Extract time in HH:mm format from various datetime string formats
 * Supports: "2025-01-01T10:30:00", "01/01/2025 10:30 AM", "10:30", etc.
 * @param dateTimeString - DateTime string in various formats
 * @returns Time string in HH:mm format, or null if parsing fails
 */
export const extractTimeFromDateTime = (dateTimeString?: string | null): string | null => {
  if (!dateTimeString) return null;

  try {
    const trimmed = dateTimeString.trim();

    // If already in HH:mm format (with 2-digit hours), return as is
    if (/^\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Handle single-digit hour format: "9:00" -> "09:00"
    if (/^\d{1}:\d{2}$/.test(trimmed)) {
      const [hours, minutes] = trimmed.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    // Handle ISO format: "2025-01-01T10:30:00" or "2025-01-01T10:30:00.000Z"
    if (trimmed.includes('T')) {
      const timePart = trimmed.split('T')[1]?.split(':').slice(0, 2).join(':');
      if (timePart) {
        // Ensure proper padding even if it looks like HH:mm
        const [hours, minutes] = timePart.split(':');
        if (hours && minutes) {
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
      }
    }

    // Handle space-separated format: "01/01/2025 10:30 AM" or "2025-01-01 10:30" or "9:00 AM"
    if (trimmed.includes(' ')) {
      const parts = trimmed.split(' ');
      // Look for time part (HH:mm or H:mm or HH:mm AM/PM or H:mm AM/PM)
      for (const part of parts) {
        if (/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i.test(part)) {
          const timeOnly = part.replace(/\s*(AM|PM)/i, '');
          const [hours, minutes] = timeOnly.split(':');
          if (hours && minutes) {
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting time from datetime:', dateTimeString, error);
    return null;
  }
};

/**
 * Convert time string to 24-hour format (HH:mm)
 * Supports both 12-hour (with AM/PM) and 24-hour formats
 * @param timeString - Time string in HH:mm or HH:mm AM/PM format
 * @returns Time string in 24-hour HH:mm format, or null if invalid
 */
export const convertTimeTo24Hour = (timeString?: string | null): string | null => {
  if (!timeString) return null;

  try {
    const trimmed = timeString.trim();

    // If already in 24-hour format (HH:mm), return as is
    if (/^\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Handle 12-hour format with AM/PM
    if (trimmed.includes('AM') || trimmed.includes('PM')) {
      const [timePart, ampm] = trimmed.split(/\s+/);
      const [hours, minutes = '00'] = timePart.split(':');

      let h = parseInt(hours, 10);
      const m = minutes.padStart(2, '0');

      if (isNaN(h) || h < 0 || h > 12) return null;

      // Convert to 24-hour format
      if (ampm.toUpperCase() === 'PM' && h !== 12) {
        h += 12;
      } else if (ampm.toUpperCase() === 'AM' && h === 12) {
        h = 0;
      }

      return `${h.toString().padStart(2, '0')}:${m}`;
    }

    return null;
  } catch (error) {
    console.error('Error converting time to 24-hour format:', timeString, error);
    return null;
  }
};

/**
 * Combine date (DD-MM-YYYY) and time (HH:mm) into ISO datetime format (YYYY-MM-DDTHH:mm:ss)
 * @param dateString - Date string in DD-MM-YYYY format
 * @param timeString - Time string in HH:mm or HH:mm AM/PM format
 * @returns ISO datetime string (YYYY-MM-DDTHH:mm:ss) or null if invalid
 */
export const combineDateAndTime = (
  dateString?: string | null,
  timeString?: string | null
): string | null => {
  if (!dateString || !timeString) return null;

  try {
    // Convert date from DD-MM-YYYY to YYYY-MM-DD
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return null;
    const [day, month, year] = dateParts;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Convert time to 24-hour format
    const time24Hour = convertTimeTo24Hour(timeString);
    if (!time24Hour) return null;

    return `${isoDate}T${time24Hour}:00`;
  } catch (error) {
    console.error('Error combining date and time:', dateString, timeString, error);
    return null;
  }
};

