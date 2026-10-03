"use client";

import { useEffect, useState } from "react";
import AddTimeOffModal from "@/components/team/AddTimeOffModal";
import type { TeamMember, TimeOffEntry } from "@/components/team/shared";
import { formatDate, toLocalDateString } from "@/lib/format-date";

type TimeOffSectionProps = {
    members: TeamMember[];
};

const typeLabels: Record<TimeOffEntry["type"], string> = {
    LEAVE: "Leave",
    PUBLIC_HOLIDAY: "Public holiday",
};

function formatRange(entry: TimeOffEntry) {
    const start = formatDate(entry.startDate);
    const end = formatDate(entry.endDate);

    return start === end ? start : `${start} → ${end}`;
}

// Scrum Master only: upcoming public holidays and leave, for the Daily Sprint
// Diary (and later for capacity planning).
export default function TimeOffSection({ members }: TimeOffSectionProps) {
    const [entries, setEntries] = useState<TimeOffEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTimeOff() {
            try {
                const response = await fetch(
                    `/api/time-off?from=${toLocalDateString()}`,
                );
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to fetch time off.");
                }

                setEntries(result.data);
            } catch (error) {
                console.error("Failed to fetch time off:", error);
                setError(
                    error instanceof Error ? error.message : "Failed to fetch time off.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchTimeOff();
    }, []);

    function handleCreated(created: TimeOffEntry[]) {
        setEntries((current) =>
            [...current, ...created].sort(
                (a, b) =>
                    a.startDate.localeCompare(b.startDate) ||
                    a.endDate.localeCompare(b.endDate),
            ),
        );
    }

    async function handleDelete(entry: TimeOffEntry) {
        if (
            !confirm(
                `Remove ${typeLabels[entry.type].toLowerCase()} for ${entry.member.name} (${formatRange(entry)})?`,
            )
        ) {
            return;
        }

        setError(null);
        setBusyId(entry.id);

        try {
            const response = await fetch(`/api/time-off/${entry.id}`, {
                method: "DELETE",
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to remove time off.");
            }

            setEntries((current) => current.filter((item) => item.id !== entry.id));
        } catch (error) {
            console.error("Failed to remove time off:", error);
            setError(
                error instanceof Error ? error.message : "Failed to remove time off.",
            );
        } finally {
            setBusyId(null);
        }
    }

    return (
        <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Time Off</h2>

                    <p className="mt-1 text-sm text-muted">
                        Upcoming public holidays and leave. They are listed in
                        the Daily Sprint Diary.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="btn-primary"
                >
                    Add Time Off
                </button>
            </div>

            {error && (
                <p className="alert-error mt-4" role="alert">
                    {error}
                </p>
            )}

            {isLoading ? (
                <p className="mt-4 text-sm text-muted">Loading time off...</p>
            ) : entries.length === 0 ? (
                <p className="empty-state mt-4">No upcoming holidays or leave.</p>
            ) : (
                <ul className="card mt-4 divide-y divide-line p-0 sm:p-0">
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                        {entry.member.name}
                                    </span>

                                    <span
                                        className={`badge ${entry.type === "LEAVE" ? "badge-warning" : "badge-brand"}`}
                                    >
                                        {typeLabels[entry.type]}
                                    </span>

                                    {!entry.member.isActive && (
                                        <span className="badge badge-danger">
                                            Deactivated
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-muted">
                                    {formatRange(entry)}
                                    {entry.note && ` · ${entry.note}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDelete(entry)}
                                disabled={busyId === entry.id}
                                className="btn-secondary text-red-700"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isAddOpen && (
                <AddTimeOffModal
                    members={members.filter((member) => member.isActive)}
                    onClose={() => setIsAddOpen(false)}
                    onCreated={handleCreated}
                />
            )}
        </section>
    );
}
