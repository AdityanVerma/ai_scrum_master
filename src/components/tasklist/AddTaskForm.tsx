"use client";

import { useState } from "react";
import { createTask } from "./api";
import type { SprintTaskOption, Task } from "./shared";
import SprintLinkFields, {
    EMPTY_LINK_FIELDS,
    toLinkPayload,
    type LinkFieldValues,
} from "./SprintLinkFields";
import TaskFields, { EMPTY_TASK_FIELDS } from "./TaskFields";

type AddTaskFormProps = {
    tasklistId: string;
    nextOrder: number;
    sprintTaskOptions: SprintTaskOption[];
    // Today's available time, from the capacity bar.
    availableMins: number;
    onCreated: (task: Task) => void;
    onCancel: () => void;
    onError: (message: string) => void;
};

// The time left on the sprint task, but no more than today's available time,
// so one long task does not fill the day on its own.
function suggestEstimate(remainingMins: number, availableMins: number) {
    if (remainingMins <= 0) {
        return Number(EMPTY_TASK_FIELDS.estimatedMins);
    }

    return availableMins > 0
        ? Math.min(remainingMins, availableMins)
        : remainingMins;
}

export default function AddTaskForm({
    tasklistId,
    nextOrder,
    sprintTaskOptions,
    availableMins,
    onCreated,
    onCancel,
    onError,
}: AddTaskFormProps) {
    const [values, setValues] = useState(EMPTY_TASK_FIELDS);
    const [link, setLink] = useState(EMPTY_LINK_FIELDS);

    // Picking a sprint task fills in its title, work type and an estimate.
    // Everything stays editable.
    function handleLinkChange(
        next: LinkFieldValues,
        picked: SprintTaskOption | null,
    ) {
        setLink(next);

        if (picked) {
            setValues((current) => ({
                ...current,
                title: picked.title,
                category: picked.category,
                estimatedMins: String(
                    suggestEstimate(picked.remainingMins, availableMins),
                ),
            }));
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const task = await createTask(tasklistId, {
                title: values.title,
                category: values.category,
                estimatedMins: Number(values.estimatedMins),
                priority: values.priority,
                order: nextOrder,
                ...toLinkPayload(link),
            });

            onCreated(task);
        } catch (error) {
            console.error("Failed to create task:", error);
            onError(
                error instanceof Error ? error.message : "Failed to create task.",
            );
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-line bg-canvas p-4"
        >
            <div className="mb-4">
                <SprintLinkFields
                    values={link}
                    options={sprintTaskOptions}
                    onChange={handleLinkChange}
                />
            </div>

            <TaskFields values={values} onChange={setValues} />

            <div className="mt-4 flex gap-2">
                <button type="submit" className="btn-primary">
                    Add Task
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
