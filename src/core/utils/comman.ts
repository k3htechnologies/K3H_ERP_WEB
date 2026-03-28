export function getTimeDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);

  const start = sH * 60 + sM;
  let end = eH * 60 + eM;

  // Handle next day (cross midnight)
  if (end < start) {
    end += 24 * 60;
  }

  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const toMinutes = (time: string) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const calculateAge = (dob: string) => {
  if (!dob) return ''

  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age.toString()
}

export function formatToKLCr(value: number): string {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 1) + " CR";
  }

  if (value >= 100000) {
    return (value / 100000).toFixed(value % 100000 === 0 ? 0 : 1) + " L";
  }

  if (value >= 1000) {
    return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + " K";
  }

  return value.toString();
}

export const isToDateGreaterOrEqualFromDate = (
  fromDate: string | Date,
  toDate: string | Date
): boolean => {
  if (!fromDate || !toDate) return false;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  return to.getTime() >= from.getTime();
};


//Common Validation: Allow Only Past N Days (Including Today)

export const isDateWithinPastDays = (dateStr: string | null | undefined, pastDays: number): boolean => {

  if (!dateStr) return false;

  const inputDate = new Date(dateStr);
  const today = new Date();

  // Normalize to date-only (important)
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const minAllowedDate = new Date(today);
  minAllowedDate.setDate(today.getDate() - pastDays);

  return inputDate >= minAllowedDate && inputDate <= today;

};

export const format24To12Hour = (hour: string, minute: string) => {
  const h = Number(hour)
  const ampm = h >= 12 ? "PM" : "AM"
  const displayHour = h >= 13 ? h - 12 : h
  return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`
}

export const formatTime = (timeString: string | undefined) => {
  if (!timeString) return "--";
  try {
    const [hours] = timeString.split(":");
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const formattedHour = hourNum % 12 || 12;
    return `${formattedHour} ${period}`;
  } catch (e) {
    return "--";
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "long" });
  return `${day}, ${month}`;
}

export const getSafeString = (value: any, fallback: string = "-"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object" && Object.keys(value).length === 0) return fallback;
  if (typeof value === "object") return fallback;
  if (String(value).trim() === "") return fallback;
  return String(value);
};
