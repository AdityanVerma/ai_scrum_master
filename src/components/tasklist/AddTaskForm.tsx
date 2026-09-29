"use client";

import { useState } from "react";
import { createTask } from "./api";
import type { Task } from "./shared";
import TaskFields, { EMPTY_TASK_FIELDS } from "./TaskFields";

type AddTaskFormProps = {
    tasklistId: string;
    nextOrder: number;
    onCreated: (task: Task) => void;
    onCancel: () => void;
    onError: (message: string) => void;
};

export default function AddTaskForm({
    tasklistId,
    nextOrder,
    onCreated,
    onCancel,
    onError,
}: AddTaskFormProps) {
    const [values, setValues] = useState(EMPTY_TASK_FIELDS);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const task = await createTask(tasklistId, {
                title: values.title,
                category: values.category,
                estimatedMins: Number(values.estimatedMins),
                priority: values.priority,
                order: nextOrder,
            });

            onCreated(task);
        } catch (error) {
            console.error("Failed to create task:", error);
            onError("Failed to create task.");
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-line bg-canvas p-4"
        >
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
