// function getISOWeek(date)
export function getISOWeek(date: Date): { year: number, week: number } {
    // Copy utc date so we don't mutate the original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    // Set to nearest Thursday: current date + 4 - current day number
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);

    // Week 1 is the week with Jan 4th in it
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((+d - + yearStart) / 86400000 + 1) / 7);

    return { year: d.getUTCFullYear(), week };
}
