export function getTimeDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);

  const start = sH * 60 + sM;
  const end = eH * 60 + eM;

  if (end <= start) return "";

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
    return (value / 10000000).toFixed( value % 10000000 === 0 ? 0 : 1 ) + " CR";
  }

  if (value >= 100000) {
    return (value / 100000).toFixed( value % 100000 === 0 ? 0 : 1 ) + " L";
  }

  if (value >= 1000) {
    return (value / 1000).toFixed( value % 1000 === 0 ? 0 : 1 ) + " K";
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

