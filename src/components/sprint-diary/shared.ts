import type {
    DiaryHeader,
    DiaryParts,
    DiaryStatus,
} from "@/lib/sprint-diary/format";

// GET /api/sprint-diary/[date]
export type DiaryData = {
    date: string;
    header: DiaryHeader;
    // Where the header came from: this date's saved header, a copy of an
    // earlier diary, or a new one with a line per active sprint.
    headerSource: "saved" | "previous" | "new";
    copiedFrom: string | null;
    parts: DiaryParts;
    published: {
        text: string;
        publishedAt: string;
        publishedBy: { id: string; name: string } | null;
    } | null;
};

// GET /api/sprint-diary
export type DiaryListItem = {
    date: string;
    status: DiaryStatus | null;
    publishedAt: string | null;
    publishedBy: { id: string; name: string } | null;
};

export const statusStyles: Record<DiaryStatus, string> = {
    RED: "badge-danger",
    ORANGE: "badge-warning",
    GREEN: "badge-brand",
};

export function isSameHeader(a: DiaryHeader, b: DiaryHeader) {
    return (
        a.phase === b.phase &&
        a.macroScope === b.macroScope &&
        a.microScope === b.microScope &&
        a.status === b.status
    );
}
