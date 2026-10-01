"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";
import { endDay, type EndDayEntry, type EndDayResult } from "./api";
import {
    formatMinutes,
    getLinkLabel,
    getPlannedMins,
    type Task,
} from "./shared";

type EndDayModalProps = {
    tasklistId: string;
    // Main tasks in list order; subtasks count towards their parent.
    tasks: Task[];
    subtasksOf: (task: Task) => Task[];
    onClose: () => void;
    onEnded: (result: EndDayResult, entries: EndDayEntry[]) => void;
};

// Time spent starts at the planned time for tasks that were worked on, so it
// is one click when the estimate was right, and at 0 for tasks still pending.
function getInitialSpent(task: Task, subtasks: Task[]) {
    return task.status === "PENDING" ? 0 : getPlannedMins(task, subtasks);
}

// End Day asks for the time spent on each task and, for tasks linked to a
// sprint task, whether the whole sprint task is finished (PHASE-8 section 5).
// Everything is saved in the same request that locks the list.
export default function EndDayModal({
    tasklistId,
    tasks,
    subtasksOf,
    onClose,
    onEnded,
}: EndDayModalProps) {
    const [spent, setSpent] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            tasks.map((task) => [
                task.id,
                String(getInitialSpent(task, subtasksOf(task))),
            ]),
        ),
    );
    const [finishes, setFinishes] = useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalMins = tasks.reduce(
        (total, task) => total + (Number(spent[task.id]) || 0),
        0,
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const entries: EndDayEntry[] = tasks.map((task) => ({
            taskId: task.id,
            spentMins: Number(spent[task.id]),
            ...(task.sprintTask && {
                finishesSprintTask: finishes[task.id] === true,
            }),
        }));

        try {
            setIsSaving(true);
            setError(null);

            const result = await endDay(tasklistId, entries);

            onEnded(result, entries);
        } catch (error) {
            console.error("Failed to end the day:", error);
            setError(
                error instanceof Error ? error.message : "Failed to end the day.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal title="End Day" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <p className="text-sm text-muted">
                    Enter the time you actually spent on each task. Ending the
                    day saves it, records the end-of-day snapshot and locks
                    this tasklist.
                </p>

                {tasks.some((task) => task.sprintTask) && (
                    <p className="hint">
                        Time on a sprint task that is still To Do moves it to
                        In Progress. Tick &ldquo;finishes&rdquo; only when the
                        whole sprint task is done, not just today&apos;s part.
                    </p>
                )}

                {tasks.length === 0 ? (
                    <p className="empty-state mt-4">No tasks to log time for.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {tasks.map((task) => (
                            <li
                                key={task.id}
                                className="rounded-lg border border-line p-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            {task.order}. {task.title}
                                        </p>

                                        <p className="text-xs text-muted">
                                            Planned{" "}
                                            {formatMinutes(
                                                getPlannedMins(task, subtasksOf(task)),
                                            )}{" "}
                                            · {task.status.replace("_", " ").toLowerCase()}
                                        </p>
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        Spent
                                        <input
                                            type="number"
                                            min="0"
                                            max={24 * 60}
                                            required
                                            value={spent[task.id] ?? ""}
                                            onChange={(event) =>
                                                setSpent((current) => ({
                                                    ...current,
                                                    [task.id]: event.target.value,
                                                }))
                                            }
                                            className="input w-24 py-1"
                                        />
                                        min
                                    </label>
                                </div>

                                {task.sprintTask &&
                                    (task.sprintTask.status === "DONE" ? (
                                        <p className="hint">
                                            {getLinkLabel(task.sprintTask)} is
                                            already done.
                                        </p>
                                    ) : (
                                        <label className="mt-2 flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={finishes[task.id] === true}
                                                onChange={(event) =>
                                                    setFinishes((current) => ({
                                                        ...current,
                                                        [task.id]: event.target.checked,
                                                    }))
                                                }
                                            />
                                            This finishes the whole sprint task (
                                            {getLinkLabel(task.sprintTask)})
                                        </label>
                                    ))}
                            </li>
                        ))}
                    </ul>
                )}

                {error && (
                    <p className="alert-error mt-4" role="alert">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-sm text-muted">
                        Total spent: <strong>{formatMinutes(totalMins)}</strong>
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary"
                        >
                            {isSaving ? "Ending..." : "End Day"}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
