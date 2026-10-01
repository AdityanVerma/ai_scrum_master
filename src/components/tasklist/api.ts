import type { SprintTaskOption, Task, Tasklist } from "./shared";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Request failed.");
    }

    return result.data;
}

export function createTask(
    tasklistId: string,
    body: {
        title: string;
        category: string;
        estimatedMins: number;
        order: number;
        priority?: string;
        parentTaskId?: string;
        sprintTaskId?: string | null;
        totalEstimateMins?: number | null;
    },
): Promise<Task> {
    return request(`/api/tasklists/${tasklistId}/tasks`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    });
}

export function updateTask(
    tasklistId: string,
    body: {
        taskId: string;
        title?: string;
        category?: string;
        estimatedMins?: number;
        status?: string;
        priority?: string;
        // null clears the link or the total estimate.
        sprintTaskId?: string | null;
        totalEstimateMins?: number | null;
    },
): Promise<Task> {
    return request(`/api/tasklists/${tasklistId}/tasks`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    });
}

export async function deleteTask(tasklistId: string, taskId: string) {
    await request(`/api/tasklists/${tasklistId}/tasks?taskId=${taskId}`, {
        method: "DELETE",
    });
}

// Sprint tasks assigned to the signed-in member in active sprints.
export function fetchSprintTaskOptions(): Promise<SprintTaskOption[]> {
    return request("/api/tasklists/sprint-tasks");
}

export function carryOverTasks(tasklistId: string): Promise<{
    fromDate: string | null;
    tasks: Task[];
    droppedLinks: number;
}> {
    return request(`/api/tasklists/${tasklistId}/carry-over`, {
        method: "POST",
    });
}

type CapturedTasklist = Pick<Tasklist, "sodCapturedAt" | "eodCapturedAt">;

export function startDay(
    tasklistId: string,
): Promise<{ tasklist: CapturedTasklist }> {
    return request(`/api/tasklists/${tasklistId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: "SOD" }),
    });
}

export type EndDayEntry = {
    taskId: string;
    spentMins: number;
    finishesSprintTask?: boolean;
};

export type SprintTaskChange = {
    sprintTaskId: string;
    taskId: string;
    from: string;
    to: string;
};

export type EndDayResult = {
    tasklist: CapturedTasklist;
    sprintTaskChanges: SprintTaskChange[];
    // Time saved, status left alone.
    skippedSprintTaskChanges: (SprintTaskChange & {
        reason: "SPRINT_ENDED" | "REASSIGNED";
    })[];
};

// Saves the time spent, updates linked sprint tasks and locks the list.
export function endDay(
    tasklistId: string,
    tasks: EndDayEntry[],
): Promise<EndDayResult> {
    return request(`/api/tasklists/${tasklistId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: "EOD", tasks }),
    });
}

export async function fetchSnapshots(tasklistId: string) {
    const data = await request(`/api/tasklists/${tasklistId}`);

    return data.snapshots;
}
