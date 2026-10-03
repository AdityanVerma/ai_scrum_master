"use client";

import { formatDate } from "@/lib/format-date";
import { statusStyles, type DiaryListItem } from "./shared";

type PastDiariesProps = {
    diaries: DiaryListItem[];
    selectedDate: string;
    onSelect: (date: string) => void;
};

// Diaries with a saved header or a published text, newest first.
export default function PastDiaries({
    diaries,
    selectedDate,
    onSelect,
}: PastDiariesProps) {
    return (
        <section className="mt-10">
            <h2 className="text-xl font-semibold">Past Diaries</h2>

            {diaries.length === 0 ? (
                <p className="empty-state mt-4">No diaries saved yet.</p>
            ) : (
                <ul className="card mt-4 divide-y divide-line p-0 sm:p-0">
                    {diaries.map((diary) => (
                        <li key={diary.date}>
                            <button
                                type="button"
                                onClick={() => onSelect(diary.date)}
                                aria-current={diary.date === selectedDate ? "date" : undefined}
                                className={`flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-brand-soft ${diary.date === selectedDate ? "bg-brand-soft" : ""}`}
                            >
                                <span className="font-medium">
                                    {formatDate(`${diary.date}T00:00:00`)}
                                </span>

                                <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                                    {diary.status && (
                                        <span className={`badge ${statusStyles[diary.status]}`}>
                                            {diary.status}
                                        </span>
                                    )}

                                    {diary.publishedAt ? (
                                        <span className="badge badge-brand">
                                            Published
                                            {diary.publishedBy && ` by ${diary.publishedBy.name}`}
                                        </span>
                                    ) : (
                                        <span className="badge badge-muted">
                                            Not published
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
