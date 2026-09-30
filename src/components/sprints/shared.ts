export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export const sprintStatusStyles: Record<SprintStatus, string> = {
    PLANNED: "badge-muted",
    ACTIVE: "badge-brand",
    COMPLETED: "badge-brand",
    CANCELLED: "badge-danger",
};

// Tasks that are not DONE (TODO, IN_PROGRESS or BLOCKED).
export function countUnfinishedTasks(tasks: { status: string }[]) {
    return tasks.filter((task) => task.status !== "DONE").length;
}
