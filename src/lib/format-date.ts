// One date and time format for the whole app, e.g. "29 Sep 2026" and "05:30 pm".
const LOCALE = "en-IN";

export function formatDate(value: string | Date) {
    return new Date(value).toLocaleDateString(LOCALE, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// A calendar date in the viewer's time zone as "YYYY-MM-DD", e.g. for "today".
// toISOString() gives the UTC date instead, which in India is still
// yesterday until 5:30 am.
export function toLocalDateString(value: Date = new Date()) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatTime(value: string | Date) {
    return new Date(value).toLocaleTimeString(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
    });
}
