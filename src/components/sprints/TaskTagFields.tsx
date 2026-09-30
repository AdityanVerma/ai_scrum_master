"use client";

import { useState } from "react";
import { NO_FUNCTION_LABEL } from "@/lib/sprint-functions";
import { WORK_TYPES } from "@/lib/work-types";

export type TaskTags = {
    functionId: string | null;
    category: string;
};

type Props = {
    sprintId: string;
    task: TaskTags & { id: string };
    functions: { id: string; name: string }[];
    onSaved: (tags: TaskTags) => void;
};

// Scrum Master only: the function (feature) and work type of a sprint task,
// for sprints planned before tasks had them or to correct the AI's choice.
// Each change is saved straight away.
export default function TaskTagFields({
    sprintId,
    task,
    functions,
    onSaved,
}: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save(change: Partial<TaskTags>) {
        try {
            setIsSaving(true);
            setError(null);

            const response = await fetch(
                `/api/sprints/${sprintId}/tasks/${task.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(change),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update task.");
            }

            onSaved({
                functionId: result.data.functionId,
                category: result.data.category,
            });
        } catch (error) {
            console.error("Failed to update task:", error);

            setError(
                error instanceof Error ? error.message : "Failed to update task.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor={`function-${task.id}`} className="label">
                        Function
                    </label>

                    <select
                        id={`function-${task.id}`}
                        value={task.functionId ?? ""}
                        onChange={(event) =>
                            save({ functionId: event.target.value || null })
                        }
                        disabled={isSaving}
                        className="input"
                    >
                        <option value="">{NO_FUNCTION_LABEL}</option>

                        {functions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`work-type-${task.id}`} className="label">
                        Work Type
                    </label>

                    <select
                        id={`work-type-${task.id}`}
                        value={task.category}
                        onChange={(event) =>
                            save({ category: event.target.value })
                        }
                        disabled={isSaving}
                        className="input"
                    >
                        {WORK_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <p className="alert-error mt-3" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
