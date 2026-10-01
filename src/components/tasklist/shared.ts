import { WORK_TYPES } from "@/lib/work-types";

// The sprint task a daily task is linked to (PHASE-8 section 5).
export type LinkedSprintTask = {
    id: string;
    taskId: string;
    title: string;
    sprint: {
        id: string;
        name: string;
    };
    function: {
        id: string;
        name: string;
    } | null;
};

// A sprint task the person can link a daily task to, with the time left.
export type SprintTaskOption = LinkedSprintTask & {
    category: string;
    estimatedHours: number;
    spentMins: number;
    remainingMins: number;
};

export type Task = {
    id: string;
    title: string;
    category: string;
    estimatedMins: number;
    order: number;
    status: string;
    priority: string;
    parentTaskId: string | null;
    // Only main tasks are linked; subtasks follow their parent.
    sprintTaskId?: string | null;
    totalEstimateMins?: number | null;
    // Not in snapshots, which only keep the task's own fields.
    sprintTask?: LinkedSprintTask | null;
};

export type Tasklist = {
    id: string;
    date: string;
    status: string;
    sodCapturedAt: string | null;
    eodCapturedAt: string | null;
    member: {
        id: string;
        name: string;
        role: string;
    };
    tasks: Task[];
};

export type Snapshot = {
    type: string;
    capturedAt: string;
    tasks: Task[];
};

// A task with subtasks counts as the sum of its subtasks.
export function getPlannedMins(task: Task, subtasks: Task[]) {
    return subtasks.length > 0
        ? subtasks.reduce((total, subtask) => total + subtask.estimatedMins, 0)
        : task.estimatedMins;
}

// The sprint work types, plus work outside the sprint.
export const TASK_CATEGORIES = [...WORK_TYPES, "Meeting", "Non-sprint"];

// 90 → "1h 30m", 45 → "45m", 0 → "0m"
export function formatMinutes(mins: number) {
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);

    if (hours === 0) return `${minutes}m`;

    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

// "Polls · TASK-003", or just "TASK-003" for a task with no function.
export function getLinkLabel(link: LinkedSprintTask) {
    return link.function ? `${link.function.name} · ${link.taskId}` : link.taskId;
}

export const NOT_LINKED_LABEL = "Not linked to a sprint task";

// Main tasks grouped by the feature (sprint function) of their linked sprint
// task, in the order the features first appear. Linked tasks whose sprint
// task has no function are grouped per sprint; unlinked tasks come last.
export function groupTasksByFeature(tasks: Task[]) {
    const groups = new Map<string, { label: string; tasks: Task[] }>();
    const unlinked: Task[] = [];

    for (const task of tasks) {
        const link = task.sprintTask;

        if (!link) {
            unlinked.push(task);
            continue;
        }

        const key = link.function
            ? `function:${link.function.id}`
            : `sprint:${link.sprint.id}`;
        const label = link.function
            ? link.function.name
            : `${link.sprint.name}: no function`;

        const group = groups.get(key) ?? { label, tasks: [] };
        group.tasks.push(task);
        groups.set(key, group);
    }

    const result = [...groups.entries()].map(([key, group]) => ({
        key,
        ...group,
    }));

    return unlinked.length > 0
        ? [...result, { key: "unlinked", label: NOT_LINKED_LABEL, tasks: unlinked }]
        : result;
}
