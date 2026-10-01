"use client";

import { useId } from "react";
import {
    formatMinutes,
    getLinkLabel,
    type LinkedSprintTask,
    type SprintTaskOption,
} from "./shared";

export type LinkFieldValues = {
    // "" when the task is not linked.
    sprintTaskId: string;
    // Hours as typed; "" for no total estimate.
    totalEstimateHours: string;
};

export const EMPTY_LINK_FIELDS: LinkFieldValues = {
    sprintTaskId: "",
    totalEstimateHours: "",
};

// What the API expects: the link, or the total estimate in minutes when the
// task is not linked. null clears either one.
export function toLinkPayload(values: LinkFieldValues) {
    const hours = Number(values.totalEstimateHours);

    return {
        sprintTaskId: values.sprintTaskId || null,
        totalEstimateMins:
            !values.sprintTaskId && values.totalEstimateHours !== "" && hours > 0
                ? Math.round(hours * 60)
                : null,
    };
}

type SprintLinkFieldsProps = {
    values: LinkFieldValues;
    options: SprintTaskOption[];
    // The task's link when editing, kept as a choice even if that sprint
    // task can no longer be picked (reassigned, finished or sprint ended).
    current?: LinkedSprintTask | null;
    onChange: (values: LinkFieldValues, picked: SprintTaskOption | null) => void;
};

// Picker grouped by function; the sprint name is added when the person has
// tasks in more than one active sprint.
function groupOptions(options: SprintTaskOption[]) {
    const severalSprints = new Set(options.map((item) => item.sprint.id)).size > 1;
    const groups = new Map<string, { label: string; options: SprintTaskOption[] }>();

    for (const option of options) {
        const key = option.function?.id ?? `none:${option.sprint.id}`;
        const label =
            (option.function?.name ?? "No function") +
            (severalSprints ? ` · ${option.sprint.name}` : "");

        const group = groups.get(key) ?? { label, options: [] };
        group.options.push(option);
        groups.set(key, group);
    }

    return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}

// The optional "Sprint task" link and, for work outside the sprint, the
// optional total estimate across days (PHASE-8 section 5).
export default function SprintLinkFields({
    values,
    options,
    current,
    onChange,
}: SprintLinkFieldsProps) {
    const id = useId();
    const currentIsMissing =
        current && !options.some((option) => option.id === current.id);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div>
                <label htmlFor={`${id}-sprint-task`} className="label">
                    Sprint task (optional)
                </label>

                <select
                    id={`${id}-sprint-task`}
                    value={values.sprintTaskId}
                    onChange={(event) => {
                        const sprintTaskId = event.target.value;

                        onChange(
                            {
                                sprintTaskId,
                                totalEstimateHours: sprintTaskId
                                    ? ""
                                    : values.totalEstimateHours,
                            },
                            options.find((option) => option.id === sprintTaskId) ??
                                null,
                        );
                    }}
                    className="input"
                >
                    <option value="">None: work outside the sprint</option>

                    {groupOptions(options).map((group) => (
                        <optgroup key={group.key} label={group.label}>
                            {group.options.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.taskId} · {option.title} (
                                    {formatMinutes(option.remainingMins)} left)
                                </option>
                            ))}
                        </optgroup>
                    ))}

                    {currentIsMissing && (
                        <option value={current.id}>
                            {getLinkLabel(current)} · {current.title} (can no
                            longer be linked)
                        </option>
                    )}
                </select>

                {options.length === 0 && (
                    <p className="hint">
                        No sprint tasks are assigned to you in an active sprint.
                    </p>
                )}
            </div>

            {!values.sprintTaskId && (
                <div>
                    <label htmlFor={`${id}-total`} className="label">
                        Total estimate in hours (optional)
                    </label>

                    <input
                        id={`${id}-total`}
                        type="number"
                        min="0.25"
                        step="0.25"
                        placeholder="e.g. 20"
                        value={values.totalEstimateHours}
                        onChange={(event) =>
                            onChange(
                                {
                                    ...values,
                                    totalEstimateHours: event.target.value,
                                },
                                null,
                            )
                        }
                        className="input"
                    />

                    <p className="hint">
                        For work outside the sprint that takes several days.
                    </p>
                </div>
            )}
        </div>
    );
}
