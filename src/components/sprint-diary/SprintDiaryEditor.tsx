"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatDate, formatTime, toLocalDateString } from "@/lib/format-date";
import {
    assembleDiary,
    formatDiaryDate,
    getMissingHeaderParts,
    type DiaryHeader,
} from "@/lib/sprint-diary/format";
import DiaryHeaderForm from "./DiaryHeaderForm";
import PastDiaries from "./PastDiaries";
import { isSameHeader, type DiaryData, type DiaryListItem } from "./shared";

const EMPTY_HEADER: DiaryHeader = {
    phase: "",
    macroScope: "",
    microScope: "",
    status: null,
};

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Request failed.");
    }

    return result.data;
}

// Today's date in the viewer's time zone. It is not known while the page is
// rendered on the server, so it is null there and filled in on the client.
const noSubscription = () => () => {};

function useToday() {
    return useSyncExternalStore(
        noSubscription,
        () => toLocalDateString(),
        () => null,
    );
}

// The Daily Sprint Diary (DAILY_SPRINT_DIARY_DESIGN.md section 3): the
// Scrum Master writes the header, the rest is generated from tasklists and
// time off, and the preview is the exact text that is copied and published.
export default function SprintDiaryEditor() {
    const today = useToday();
    const [pickedDate, setPickedDate] = useState<string | null>(null);
    const date = pickedDate ?? today;

    const [diary, setDiary] = useState<DiaryData | null>(null);
    const [form, setForm] = useState<DiaryHeader>(EMPTY_HEADER);
    const [diaries, setDiaries] = useState<DiaryListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    // Bumped to load the list of past diaries again.
    const [listKey, setListKey] = useState(0);

    // Load the diary for the chosen date; the form starts from its header.
    useEffect(() => {
        if (!date) return;

        let cancelled = false;

        request(`/api/sprint-diary/${date}`)
            .then((data: DiaryData) => {
                if (cancelled) return;

                setDiary(data);
                setForm(data.header);
                setLoadError(null);
            })
            .catch((error) => {
                if (cancelled) return;

                console.error("Failed to load the diary:", error);
                setLoadError(
                    error instanceof Error ? error.message : "Failed to load the diary.",
                );
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [date]);

    useEffect(() => {
        let cancelled = false;

        request("/api/sprint-diary")
            .then((data: DiaryListItem[]) => {
                if (!cancelled) setDiaries(data);
            })
            .catch((error) => {
                console.error("Failed to load past diaries:", error);
            });

        return () => {
            cancelled = true;
        };
    }, [listKey]);

    useEffect(() => {
        if (!notice) return;

        const timer = setTimeout(() => setNotice(null), 6000);

        return () => clearTimeout(timer);
    }, [notice]);

    const isPublished = Boolean(diary?.published);
    // Typed in the form but not saved for this date yet.
    const hasEdits = diary !== null && !isPublished && !isSameHeader(form, diary.header);

    // A reload or close would lose typed header text.
    useEffect(() => {
        if (!hasEdits) return;

        const warn = (event: BeforeUnloadEvent) => event.preventDefault();

        window.addEventListener("beforeunload", warn);

        return () => window.removeEventListener("beforeunload", warn);
    }, [hasEdits]);

    function handleDateChange(nextDate: string) {
        if (!nextDate || nextDate === date) return;

        if (hasEdits && !confirm("Leave this date? Your header changes are not saved.")) {
            return;
        }

        setPickedDate(nextDate);
        setDiary(null);
        setLoadError(null);
        setIsLoading(true);
    }

    // Rebuild the generated parts (tasklists may have changed) but keep
    // what is typed in the header.
    async function handleRefresh() {
        if (!date) return;

        try {
            setIsBusy(true);

            const data: DiaryData = await request(`/api/sprint-diary/${date}`);

            setDiary((current) =>
                current
                    ? { ...data, header: current.header, headerSource: current.headerSource }
                    : data,
            );
        } catch (error) {
            console.error("Failed to refresh the diary:", error);
            setNotice({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to refresh the diary.",
            });
        } finally {
            setIsBusy(false);
        }
    }

    async function handleSave() {
        if (!date) return;

        try {
            setIsBusy(true);

            await request(`/api/sprint-diary/${date}`, {
                method: "PUT",
                headers: JSON_HEADERS,
                body: JSON.stringify(form),
            });

            setDiary((current) =>
                current
                    ? { ...current, header: form, headerSource: "saved", copiedFrom: null }
                    : current,
            );
            setListKey((key) => key + 1);
            setNotice({ type: "success", message: "Header saved." });
        } catch (error) {
            console.error("Failed to save the header:", error);
            setNotice({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to save the header.",
            });
        } finally {
            setIsBusy(false);
        }
    }

    if (!date || isLoading) {
        return (
            <PageContainer>
                <p className="text-sm text-muted">Loading the diary...</p>
            </PageContainer>
        );
    }

    const datePicker = (
        <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="diary-date" className="sr-only">
                Diary date
            </label>

            <input
                id="diary-date"
                type="date"
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                className="input w-auto"
            />

            {today && date !== today && (
                <button
                    type="button"
                    onClick={() => handleDateChange(today)}
                    className="btn-secondary"
                >
                    Today
                </button>
            )}
        </div>
    );

    if (loadError || !diary) {
        return (
            <PageContainer>
                <PageHeader title="Sprint Diary" action={datePicker} />

                <p className="alert-error" role="alert">
                    {loadError ?? "Failed to load the diary."}
                </p>
            </PageContainer>
        );
    }

    const label = formatDiaryDate(date);
    const previewText = diary.published
        ? diary.published.text
        : assembleDiary(date, form, diary.parts);
    const missing = getMissingHeaderParts(form);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(previewText);
            setNotice({ type: "success", message: "Copied. Paste it into Google Chat." });
        } catch (error) {
            console.error("Failed to copy the diary:", error);
            setNotice({
                type: "error",
                message: "Copy failed. Select the text in the preview and copy it.",
            });
        }
    }

    async function handlePublish() {
        const question =
            missing.length > 0
                ? `The header has no ${missing.join(", ")}.\n\nPublish the diary for ${label} anyway? It cannot be changed afterwards.`
                : `Publish the diary for ${label}? It cannot be changed afterwards.`;

        if (!confirm(question)) return;

        try {
            setIsBusy(true);

            await request(`/api/sprint-diary/${date}/publish`, {
                method: "POST",
                headers: JSON_HEADERS,
                body: JSON.stringify({ ...form, text: previewText }),
            });

            const data: DiaryData = await request(`/api/sprint-diary/${date}`);

            setDiary(data);
            setForm(data.header);
            setListKey((key) => key + 1);
            setNotice({ type: "success", message: `Diary for ${label} published.` });
        } catch (error) {
            console.error("Failed to publish the diary:", error);
            setNotice({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to publish the diary.",
            });
        } finally {
            setIsBusy(false);
        }
    }

    // What the header form is showing, in words.
    let headerNote: string;

    if (diary.published) {
        const by = diary.published.publishedBy ? ` by ${diary.published.publishedBy.name}` : "";
        headerNote = `Published on ${formatDate(diary.published.publishedAt)} at ${formatTime(diary.published.publishedAt)}${by}. A published diary cannot be changed.`;
    } else if (hasEdits) {
        headerNote = "You have unsaved header changes.";
    } else if (diary.headerSource === "previous" && diary.copiedFrom) {
        headerNote = `Copied from the diary of ${formatDate(`${diary.copiedFrom}T00:00:00`)}. Save it to keep it for this date.`;
    } else if (diary.headerSource === "new") {
        headerNote = "First diary: the macro scope starts with one line per active sprint.";
    } else {
        headerNote = "Saved for this date.";
    }

    return (
        <PageContainer>
            <PageHeader
                eyebrow="Daily"
                title={`Sprint Diary: ${label}`}
                description="Write the header; each person's Yesterday and Today, overtime sprints and time off come from the app."
                action={datePicker}
            />

            {notice && (
                <p
                    role={notice.type === "error" ? "alert" : "status"}
                    className={`mb-6 rounded-lg px-4 py-3 text-sm ${notice.type === "error" ? "alert-error" : "bg-brand-soft text-brand-strong"}`}
                >
                    {notice.message}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="card">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Header</h2>

                        {!isPublished && (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isBusy || (diary.headerSource === "saved" && !hasEdits)}
                                className="btn-secondary"
                            >
                                Save Header
                            </button>
                        )}
                    </div>

                    <p className="hint mt-0 mb-5">{headerNote}</p>

                    <DiaryHeaderForm
                        values={form}
                        disabled={isPublished || isBusy}
                        onChange={setForm}
                    />
                </section>

                <section className="card flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">
                            {isPublished ? "Published Text" : "Preview"}
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {!isPublished && (
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={isBusy}
                                    className="btn-secondary"
                                >
                                    Refresh
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleCopy}
                                className="btn-secondary"
                            >
                                Copy for Google Chat
                            </button>

                            {!isPublished && (
                                <button
                                    type="button"
                                    onClick={handlePublish}
                                    disabled={isBusy}
                                    className="btn-primary"
                                >
                                    Publish
                                </button>
                            )}
                        </div>
                    </div>

                    {!isPublished && missing.length > 0 && (
                        <p className="mt-3 text-sm text-amber-700">
                            Header incomplete: no {missing.join(", ")}.
                        </p>
                    )}

                    {!isPublished && (
                        <p className="hint">
                            Refresh picks up tasklist changes made since this
                            page was opened.
                        </p>
                    )}

                    <pre className="mt-4 max-h-[75vh] flex-1 overflow-auto rounded-lg bg-canvas p-4 font-mono text-xs leading-5 whitespace-pre-wrap">
                        {previewText}
                    </pre>
                </section>
            </div>

            <PastDiaries
                diaries={diaries}
                selectedDate={date}
                onSelect={handleDateChange}
            />
        </PageContainer>
    );
}
