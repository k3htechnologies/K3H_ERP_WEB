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
