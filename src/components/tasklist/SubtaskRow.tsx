"use client";

import { useState } from "react";
import { deleteTask, updateTask } from "./api";
import type { Task } from "./shared";
import StatusSelect from "./StatusSelect";
import SubtaskFields from "./SubtaskFields";

type SubtaskRowProps = {
    tasklistId: string;
    parentOrder: number;
    subtask: Task;
    locked: boolean;
    onUpdated: (task: Task) => void;
    onDeleted: (taskId: string) => void;
    onError: (message: string) => void;
};

export default function SubtaskRow({
    tasklistId,
    parentOrder,
    subtask,
    locked,
    onUpdated,
    onDeleted,
    onError,
}: SubtaskRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({
        title: subtask.title,
        estimatedMins: String(subtask.estimatedMins),
    });

    async function handleStatusChange(status: string) {
        try {
            const updated = await updateTask(tasklistId, {
                taskId: subtask.id,
                status,
            });

            onUpdated(updated);
        } catch (error) {
            console.error("Failed to update subtask status:", error);
            onError("Failed to update subtask status.");
        }
    }

    async function handleSave() {
        try {
            const updated = await updateTask(tasklistId, {
                taskId: subtask.id,
                title: editValues.title,
                estimatedMins: Number(editValues.estimatedMins),
            });

            onUpdated(updated);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update subtask:", error);
            onError("Failed to update subtask.");
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${subtask.title}"?`)) {
            return;
        }

        try {
            await deleteTask(tasklistId, subtask.id);
            onDeleted(subtask.id);
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            onError("Failed to delete subtask.");
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                    <span>
                        {parentOrder}.{subtask.order} {subtask.title}
                    </span>

                    <span className="ml-2 text-muted">
                        — {subtask.estimatedMins / 60}h
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <StatusSelect
                        value={subtask.status}
                        disabled={locked}
                        onChange={handleStatusChange}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setEditValues({
                                title: subtask.title,
                                estimatedMins: String(subtask.estimatedMins),
                            });
                            setIsEditing(true);
                        }}
                        disabled={locked}
                        className="text-xs font-medium text-brand-strong hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="mt-2 rounded-lg border border-line bg-canvas p-3">
                    <SubtaskFields
                        values={editValues}
                        onChange={setEditValues}
                    />

                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn-primary px-3"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary px-3"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
