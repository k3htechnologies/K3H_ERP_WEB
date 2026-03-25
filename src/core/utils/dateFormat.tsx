/**
 * Format date string with time to "DD Month YYYY HH:MM AM/PM" format
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timeString - Time string in HH:MM format (optional)
 * @returns Formatted date and time string (e.g., "07 July 2025 2:30 PM")
 */
export const formatDate_dd_MonthName_yy_hh_mm = (
  dateString: string,
  timeString?: string,
): string => {
  if (!dateString || dateString.trim() === "") {
    return "";
  }

  try {
    let date: Date;

    // If timeString is provided, combine date and time
    if (timeString && timeString.trim() !== "") {
      const combinedDateTime = `${dateString}T${timeString}`;
      date = new Date(combinedDateTime);
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Format time to 12-hour format with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;

    return `${day} ${month} ${year} ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "";
  }
};

/**
 * Format date string to "DD Month YYYY" format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "07 July 2025")
 */
export const formatDate_dd_MonthName_yy = (
  dateString: string | Date,
): string => {
  if (!dateString || dateString === "") {
    return "";
  }

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * CONVERT "YYYY-MM-DD" → "DD-MM-YYYY"
 * Handles null, undefined, empty and invalid date safely.
 */
export const formatDate_dd_mm_yyyy = (dateString?: string | null): string => {
  if (!dateString) return "";

  const trimmed = dateString.trim();
  if (!trimmed) return "";

  // supports YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (!match) return "";

  const [, yyyy, mm, dd] = match;

  return `${dd}-${mm}-${yyyy}`;
};
/**
 * Extract time string (HH:MM) from ISO datetime string
 * @param isoString - ISO datetime string (e.g., "2025-01-15T10:30:00" or "10:30")
 * @returns Time string in HH:MM format or "00:00" if invalid
 */
export const parseTimeFromISO = (isoString: string): string => {
  if (!isoString) return "00:00";
  if (/^\d{2}:\d{2}$/.test(isoString)) {
    return isoString;
  }
  const timeMatch = isoString.match(/T(\d{2}):(\d{2})/);
  return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "00:00";
};

/**
 * Get today's date in DD-MM-YYYY format
 * @returns Today's date string in DD-MM-YYYY format (e.g., "15-01-2025")
 */
export const getTodayDate_dd_mm_yyyy = (): string => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const isPreviousDate = (date: Date): boolean => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth();
  const dateDay = date.getDate();

  return (
    dateYear < todayYear ||
    (dateYear === todayYear && dateMonth < todayMonth) ||
    (dateYear === todayYear && dateMonth === todayMonth && dateDay < todayDay)
  );
};

export const convert_dd_mm_yyyy_To_Yyyy_mm_dd = (
  value?: string | null,
): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

export const convert_yy_mm_dd_To_dd_mm_yyyy = (
  value?: string | Date | null,
): string | null => {
  if (!value) return null;

  const trimmed = value.toString().trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

export const convert_date_yy_mm_dd_To_dd_mm_yyyy = (date?: Date) => {
  if (!date) return "";

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}-${m}-${y}`;
};

export const convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd = (date?: string | null) => {
  if (!date) return "";
  return date.split("T")[0];
};

/**
 * Convert UTC datetime string to local time
 * @param utcDateTimeString - UTC DateTime string in ISO format (e.g., "2025-12-03T15:26:50.513Z" or "2025-12-03T15:26:50.513")
 * @returns Local Date object or null if invalid
 */
export const convertUtcToLocal = (
  utcDateTimeString?: string | null,
): Date | null => {
  if (
    !utcDateTimeString ||
    typeof utcDateTimeString !== "string" ||
    utcDateTimeString.trim() === ""
  ) {
    return null;
  }

  try {
    const trimmed = utcDateTimeString.trim();

    // If it already has timezone info (Z or offset), parse directly
    if (trimmed.includes("Z") || trimmed.match(/[+-]\d{2}:\d{2}$/)) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date; // Date object automatically converts UTC to local time
      }
      return null;
    }

    // If no timezone indicator, treat as UTC by appending 'Z'
    // Parse the ISO string and manually create UTC date
    const isoMatch = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?/,
    );
    if (isoMatch) {
      const [
        ,
        year,
        month,
        day,
        hour,
        minute,
        second = "00",
        millisecond = "000",
      ] = isoMatch;
      // Create UTC date using Date.UTC, then convert to local
      const utcTime = Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-indexed
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10),
        parseInt(millisecond.padEnd(3, "0").substring(0, 3), 10), // Ensure 3 digits for milliseconds
      );
      return new Date(utcTime); // This creates a local Date object from UTC timestamp
    }

    // Fallback: try appending Z and parsing
    const date = new Date(`${trimmed}Z`);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    console.error("Error converting UTC to local time:", error);
    return null;
  }
};

/**
 * Extract time from datetime string and format to "HH:MM AM/PM" format
 * Converts UTC to local time for display
 * @param dateTimeString - DateTime string in ISO format (e.g., "2025-12-03T15:26:50.513" or "2025-12-03T15:26:50.513Z")
 * @returns Formatted time string (e.g., "3:26 PM") or empty string if invalid
 */
export const formatTimeFromDateTime = (
  dateTimeString?: string | null,
): string => {
  if (!dateTimeString || typeof dateTimeString !== "string") return "";

  const trimmed = dateTimeString.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return "";

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

/**
 * Format date string to "DD Month YYYY" format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "July 2025")
 */
export const formatDate_MonthName_yy = (dateString: string | Date): string => {
  if (!dateString || dateString === "") {
    return "";
  }

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const formatDate_Day_MonthName = (dateString: string | Date): string => {
  if (!dateString || dateString === "") {
    return "";
  }

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDay();

    return `${day} ${month} `;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const convert_hh_mm_ss_to_hh_mm = (timeString?: string) => {

    if (!timeString || timeString === "00:00:00") return "";

    const [hours, minutes] = timeString.split(":");

    const hourNum = parseInt(hours, 10);

    if (isNaN(hourNum)) return "";

    const period = hourNum >= 12 ? "PM" : "AM";
    
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

    return `${formattedHour}:${minutes} ${period}`;
};

