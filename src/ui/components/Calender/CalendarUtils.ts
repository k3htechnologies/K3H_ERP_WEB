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
}

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

export const getHours = () =>
    [...Array(12)].map((_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

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
