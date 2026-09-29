export type Task = {
    id: string;
    title: string;
    category: string;
    estimatedMins: number;
    order: number;
    status: string;
    priority: string;
    parentTaskId: string | null;
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

export const TASK_CATEGORIES = [
    "Development",
    "Testing",
    "Documentation",
    "Meeting",
    "Non-sprint",
];
