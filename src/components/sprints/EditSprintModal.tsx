"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";

export type EditableSprint = {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
};

type EditSprintModalProps = {
    sprint: EditableSprint;
    onClose: () => void;
    onSaved: (sprint: EditableSprint) => void;
};

// Dates are stored as midnight UTC, so the first 10 characters of the ISO
// string are the calendar date.
function toDateInput(value: string) {
    return value.slice(0, 10);
}

export default function EditSprintModal({
    sprint,
    onClose,
    onSaved,
}: EditSprintModalProps) {
    const [name, setName] = useState(sprint.name);
    const [goal, setGoal] = useState(sprint.goal);
    const [startDate, setStartDate] = useState(toDateInput(sprint.startDate));
    const [endDate, setEndDate] = useState(toDateInput(sprint.endDate));
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (endDate < startDate) {
            setFormError("End date cannot be before start date.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`/api/sprints/${sprint.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, goal, startDate, endDate }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to save sprint.");
            }

            onSaved(result.data);
            onClose();
        } catch (error) {
            console.error("Failed to save sprint:", error);

            setFormError(
                error instanceof Error ? error.message : "Failed to save sprint.",
            );
            setIsSaving(false);
        }
    }

    return (
        <Modal title="Edit Sprint" onClose={onClose}>
            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                <div>
                    <label htmlFor="sprint-name" className="label">Name</label>

                    <input
                        id="sprint-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="sprint-goal" className="label">Goal</label>

                    <textarea
                        id="sprint-goal"
                        value={goal}
                        onChange={(event) => setGoal(event.target.value)}
                        rows={4}
                        className="input resize-y"
                        required
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="sprint-start" className="label">Start Date</label>

                        <input
                            id="sprint-start"
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="sprint-end" className="label">End Date</label>

                        <input
                            id="sprint-end"
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(event) => setEndDate(event.target.value)}
                            className="input"
                            required
                        />
                    </div>
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
                        {isSaving ? "Saving..." : "Save Sprint"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
