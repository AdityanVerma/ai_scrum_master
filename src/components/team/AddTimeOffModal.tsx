"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";
import { toLocalDateString } from "@/lib/format-date";
import type { TeamMember, TimeOffEntry } from "@/components/team/shared";

type AddTimeOffModalProps = {
    // Active members only; time off cannot be added for deactivated ones.
    members: TeamMember[];
    onClose: () => void;
    onCreated: (entries: TimeOffEntry[]) => void;
};

// One entry is saved per chosen member, so a public holiday can be added for
// several people at once. Rendered only while open.
export default function AddTimeOffModal({
    members,
    onClose,
    onCreated,
}: AddTimeOffModalProps) {
    const today = toLocalDateString();
    const [type, setType] = useState<TimeOffEntry["type"]>("LEAVE");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function toggleMember(id: string, checked: boolean) {
        setMemberIds((current) =>
            checked ? [...current, id] : current.filter((item) => item !== id),
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (memberIds.length === 0) {
            setFormError("Choose at least one team member.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/time-off", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberIds,
                    type,
                    startDate,
                    endDate,
                    note,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to add time off.");
            }

            onCreated(result.data);
            onClose();
        } catch (error) {
            console.error("Failed to add time off:", error);

            setFormError(
                error instanceof Error ? error.message : "Failed to add time off.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal title="Add Time Off" onClose={onClose}>
            <p className="mb-6 text-sm text-muted">
                Public holidays and leave appear in the Daily Sprint Diary until
                they are over.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                        <label htmlFor="time-off-type" className="label">
                            Type
                        </label>

                        <select
                            id="time-off-type"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value as TimeOffEntry["type"])
                            }
                            className="input"
                        >
                            <option value="LEAVE">Leave</option>
                            <option value="PUBLIC_HOLIDAY">Public holiday</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="time-off-start" className="label">
                            First day
                        </label>

                        <input
                            id="time-off-start"
                            type="date"
                            value={startDate}
                            onChange={(event) => {
                                setStartDate(event.target.value);

                                if (endDate < event.target.value) {
                                    setEndDate(event.target.value);
                                }
                            }}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="time-off-end" className="label">
                            Last day
                        </label>

                        <input
                            id="time-off-end"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) => setEndDate(event.target.value)}
                            className="input"
                            required
                        />
                    </div>
                </div>

                <fieldset>
                    <legend className="label">Who</legend>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {members.map((member) => (
                            <label
                                key={member.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={memberIds.includes(member.id)}
                                    onChange={(event) =>
                                        toggleMember(member.id, event.target.checked)
                                    }
                                />
                                {member.name}
                            </label>
                        ))}
                    </div>

                    <p className="hint">
                        For a public holiday, tick everyone it applies to.
                    </p>
                </fieldset>

                <div>
                    <label htmlFor="time-off-note" className="label">
                        Note (optional)
                    </label>

                    <input
                        id="time-off-note"
                        type="text"
                        value={note}
                        maxLength={200}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="e.g. Gandhi Jayanti"
                        className="input"
                    />
                </div>

                {formError && (
                    <p className="alert-error" role="alert">
                        {formError}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>

                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? "Adding..." : "Add Time Off"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
