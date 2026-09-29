"use client";

import { useState } from "react";
import { createTask, deleteTask, updateTask } from "./api";
import { getPlannedMins, type Task } from "./shared";
import StatusSelect from "./StatusSelect";
import SubtaskFields, { EMPTY_SUBTASK_FIELDS } from "./SubtaskFields";
import SubtaskRow from "./SubtaskRow";
import TaskFields, { EMPTY_TASK_FIELDS } from "./TaskFields";

type TaskCardProps = {
    tasklistId: string;
    task: Task;
    subtasks: Task[];
    locked: boolean;
    onCreated: (task: Task) => void;
    onUpdated: (task: Task) => void;
    onDeleted: (taskId: string) => void;
    onError: (message: string) => void;
};

const priorityStyles: Record<string, string> = {
    HIGH: "badge-danger",
    MEDIUM: "badge-warning",
    LOW: "badge-muted",
};

export default function TaskCard({
    tasklistId,
    task,
    subtasks,
    locked,
    onCreated,
    onUpdated,
    onDeleted,
    onError,
}: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState(EMPTY_TASK_FIELDS);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [subtaskValues, setSubtaskValues] = useState(EMPTY_SUBTASK_FIELDS);

    const sortedSubtasks = [...subtasks].sort((a, b) => a.order - b.order);

    async function handleStatusChange(status: string) {
        try {
            const updated = await updateTask(tasklistId, {
                taskId: task.id,
                status,
            });

            onUpdated(updated);
        } catch (error) {
            console.error("Failed to update task status:", error);
            onError("Failed to update task status.");
        }
    }

    async function handleSaveEdit() {
        try {
            const updated = await updateTask(tasklistId, {
                taskId: task.id,
                title: editValues.title,
                category: editValues.category,
                estimatedMins: Number(editValues.estimatedMins),
                status: task.status,
                priority: editValues.priority,
            });

            onUpdated(updated);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update task:", error);
            onError("Failed to update task.");
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${task.title}"?`)) {
            return;
        }

        try {
            await deleteTask(tasklistId, task.id);
            onDeleted(task.id);
        } catch (error) {
            console.error("Failed to delete task:", error);
            onError("Failed to delete task.");
        }
    }

    async function handleAddSubtask(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const created = await createTask(tasklistId, {
                title: subtaskValues.title,
                category: task.category,
                estimatedMins: Number(subtaskValues.estimatedMins),
                order: subtasks.length + 1,
                parentTaskId: task.id,
            });

            onCreated(created);
            setIsAddingSubtask(false);
        } catch (error) {
            console.error("Failed to create subtask:", error);
            onError("Failed to create subtask.");
        }
    }

    return (
        <div className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-brand-strong">
                            {task.category}
                        </p>

                        <span
                            className={`badge py-0.5 ${priorityStyles[task.priority] ?? "badge-warning"}`}
                        >
                            {task.priority}
                        </span>
                    </div>

                    <h3 className="mt-1 font-medium">
                        {task.order}. {task.title}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">
                        {getPlannedMins(task, subtasks) / 60}h
                    </span>

                    <StatusSelect
                        value={task.status}
                        disabled={locked}
                        onChange={handleStatusChange}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setEditValues({
                                title: task.title,
                                category: task.category,
                                priority: task.priority,
                                estimatedMins: String(task.estimatedMins),
                            });
                            setIsEditing(true);
                        }}
                        disabled={locked}
                        className="text-sm font-medium text-brand-strong hover:underline disabled:opacity-50"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={locked}
                        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="mt-4 rounded-lg border border-line bg-canvas p-4">
                    <TaskFields values={editValues} onChange={setEditValues} />

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="btn-primary"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => {
                    setSubtaskValues(EMPTY_SUBTASK_FIELDS);
                    setIsAddingSubtask(true);
                }}
                className="mt-3 text-sm font-medium text-brand-strong hover:underline"
            >
                + Add Subtask
            </button>

            {isAddingSubtask && (
                <form
                    onSubmit={handleAddSubtask}
                    className="mt-3 rounded-lg border border-line bg-canvas p-3"
                >
                    <SubtaskFields
                        values={subtaskValues}
                        onChange={setSubtaskValues}
                    />

                    <div className="mt-3 flex gap-2">
                        <button type="submit" className="btn-primary px-3">
                            Add Subtask
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAddingSubtask(false)}
                            className="btn-secondary px-3"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {sortedSubtasks.length > 0 && (
                <div className="mt-3 space-y-2 pl-4">
                    {sortedSubtasks.map((subtask) => (
                        <SubtaskRow
                            key={subtask.id}
                            tasklistId={tasklistId}
                            parentOrder={task.order}
                            subtask={subtask}
                            locked={locked}
                            onUpdated={onUpdated}
                            onDeleted={onDeleted}
                            onError={onError}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
