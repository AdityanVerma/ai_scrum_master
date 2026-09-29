import type { Task } from "./shared";

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
