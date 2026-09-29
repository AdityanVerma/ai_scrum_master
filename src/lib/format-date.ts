// One date and time format for the whole app, e.g. "29 Sep 2026" and "05:30 pm".
const LOCALE = "en-IN";

export function formatDate(value: string | Date) {
    return new Date(value).toLocaleDateString(LOCALE, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatTime(value: string | Date) {
    return new Date(value).toLocaleTimeString(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
    });
}
