import type { CalendarEvent } from "./CalendarEvent";

export const getMonthMatrix = (date: Date) => {

    const start = new Date(date.getFullYear(), date.getMonth(), 1);

    const matrix = [];
    const day = new Date(start);

    day.setDate(day.getDate() - ((day.getDay() + 6) % 7));

    while (matrix.length < 42) {
        matrix.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    return matrix;
};

export const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    return [...Array(7)].map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
};

export const toLocalDateKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const isSameDate = (first: Date, second?: Date) =>
    Boolean(
        second &&
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate(),
    );

export const getHours = () =>
    [...Array(24)].map((_, i) => `${i.toString().padStart(2, "0")}:00`);

export const parseEventDateTime = (
    start?: string,
): { dateStr: string; hourStr: string | null } => {
    if (!start) return { dateStr: "", hourStr: null };
    const parts = start.split("T");
    const dateStr = parts[0]?.trim() || "";
    const timeRaw = parts[1]?.trim();
    if (!timeRaw) return { dateStr, hourStr: null };

    const isPM = /pm/i.test(timeRaw);
    const isAM = /am/i.test(timeRaw);
    const cleanTime = timeRaw.replace(/[ap]m/gi, "").trim();
    const timeSegments = cleanTime.split(":");
    let hourNum = parseInt(timeSegments[0], 10);
    if (Number.isNaN(hourNum)) return { dateStr, hourStr: null };

    if (isPM && hourNum < 12) hourNum += 12;
    else if (isAM && hourNum === 12) hourNum = 0;

    return { dateStr, hourStr: String(hourNum).padStart(2, "0") };
};

export const getEventColorClass = (event: CalendarEvent) => {
    switch (event.color) {
        case "orange":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "green":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "blue":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return event.type?.toUpperCase() === "TASK"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : event.type?.toUpperCase() === "MEETING"
                    ? "bg-violet-100 text-violet-800 border-violet-200"
                    : "bg-orange-100 text-orange-800 border-orange-200";
    }
};
