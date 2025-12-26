export const getMonthMatrix = (date: Date) => {

    const start = new Date(date.getFullYear(), date.getMonth(), 1);

    const matrix = [];
    let day = new Date(start);

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

export const getHours = () =>
    [...Array(12)].map((_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
