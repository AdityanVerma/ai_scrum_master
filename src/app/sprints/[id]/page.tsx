"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format-date";
import AddDocumentModal, {
    type Document,
} from "@/components/documents/AddDocumentModal";

type Task = {
    id: string;
    taskId: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
    title: string;
    description: string;
    complexity: "LOW" | "MEDIUM" | "HIGH";
    estimatedHours: number;

    assignedTo: {
        id: string;
        name: string;
        role: string;
        skills: {
            id: string;
            skill: string;
        }[];
    } | null;

    skills: {
        id: string;
        skill: string;
    }[];

    dependencies: {
        id: string;
        taskId: string;
        dependsOnTaskId: string;
        dependsOn: {
            id: string;
            taskId: string;
            title: string;
        };
    }[];
};

type Sprint = {
    id: string;
    name: string;
    status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    goal: string;
    startDate: string;
    endDate: string;
    totalEstimatedHours: number;
    tasks: Task[];
};

type SprintProgress = {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
    blockedTasks: number;
    progressPercentage: number;
};

type AssignmentRecommendation = {
    recommendedMember: {
        memberId: string;
        name: string;
        role: string;
        matchedSkills: string[];
        missingSkills: string[];
        matchPercentage: number;
    } | null;
    candidates: {
        memberId: string;
        name: string;
        role: string;
        matchedSkills: string[];
        missingSkills: string[];
        matchPercentage: number;
    }[];
};

type TeamMember = {
    id: string;
    name: string;
    role: string;
};

const sprintStatusStyles: Record<Sprint["status"], string> = {
    PLANNED: "badge-muted",
    ACTIVE: "badge-brand",
    COMPLETED: "badge-brand",
    CANCELLED: "badge-danger",
};

const complexityStyles: Record<Task["complexity"], string> = {
    LOW: "badge-brand",
    MEDIUM: "badge-warning",
    HIGH: "badge-danger",
};

export default function SprintDetailPage() {
    const { id: sprintId } = useParams<{ id: string }>();
    // States
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [progress, setProgress] = useState<SprintProgress | null>(null);
    const [recommendations, setRecommendations] = useState<Record<string, AssignmentRecommendation>>({});
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // Dcocumentation States
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);

    // Loading & Errors
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingRecommendation, setLoadingRecommendation] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        async function fetchSprint() {
            try {
                const [sprintResponse, progressResponse, documentsResponse] =
                    await Promise.all([
                        fetch(`/api/sprints/${sprintId}`),
                        fetch(`/api/sprints/${sprintId}/progress`),
                        fetch(`/api/documents?sprintId=${sprintId}`),
                    ]);

                const sprintResult = await sprintResponse.json();
                const progressResult = await progressResponse.json();
                const documentsResult = await documentsResponse.json();

                if (!sprintResponse.ok) {
                    throw new Error(
                        sprintResult.error || "Failed to fetch sprint.",
                    );
                }

                if (!progressResponse.ok) {
                    throw new Error(
                        progressResult.error ||
                        "Failed to fetch sprint progress.",
                    );
                }

                if (!documentsResponse.ok) {
                    throw new Error(
                        documentsResult.error ||
                        "Failed to fetch sprint documents.",
                    );
                }

                setSprint(sprintResult.data);
                setProgress(progressResult.data);
                setDocuments(documentsResult.data);
            } catch (error) {
                console.error("Failed to fetch sprint:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch sprint.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchSprint();
    }, [sprintId]);

    useEffect(() => {
        async function fetchTeamMembers() {
            try {
                const response = await fetch("/api/team-members");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch team members.",
                    );
                }

                setTeamMembers(result.data);
            } catch (error) {
                console.error(
                    "Failed to fetch team members:",
                    error,
                );
            }
        }

        fetchTeamMembers();
    }, []);

    // Handle Active Sprint
    async function handleActivateSprint() {
        if (!sprint) return;

        try {
            setIsActivating(true);
            setActionError(null);

            const response = await fetch(
                `/api/sprints/${sprint.id}/activate`,
                {
                    method: "PATCH",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to activate sprint.",
                );
            }

            setSprint((currentSprint) =>
                currentSprint
                    ? {
                        ...currentSprint,
                        status: result.data.status,
                    }
                    : currentSprint,
            );
        } catch (error) {
            console.error("Failed to activate sprint:", error);

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to activate sprint.",
            );
        } finally {
            setIsActivating(false);
        }
    }

    // Handle Change in Task Status
    async function handleTaskStatusChange(
        taskId: string,
        status: Task["status"],
    ) {
        if (!sprint) return;

        try {
            setActionError(null);

            const response = await fetch(
                `/api/sprints/${sprint.id}/tasks/${taskId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to update task status.",
                );
            }

            setSprint((currentSprint) =>
                currentSprint
                    ? {
                        ...currentSprint,
                        tasks: currentSprint.tasks.map((task) =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    status: result.data.status,
                                }
                                : task,
                        ),
                    }
                    : currentSprint,
            );

            const progressResponse = await fetch(
                `/api/sprints/${sprint.id}/progress`,
            );

            const progressResult = await progressResponse.json();

            if (!progressResponse.ok) {
                throw new Error(
                    progressResult.error ||
                    "Failed to refresh sprint progress.",
                );
            }

            setProgress(progressResult.data);
        } catch (error) {
            console.error("Failed to update task status:", error);

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to update task status.",
            );
        }
    }

    // Handle Fetching Recommended Assignee
    async function handleRecommendAssignee(taskId: string) {
        try {
            setLoadingRecommendation(taskId);
            setActionError(null);

            const response = await fetch(
                "/api/assignment/task-recommendation",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ taskId }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Failed to get assignment recommendation.",
                );
            }

            setRecommendations((current) => ({
                ...current,
                [taskId]: result.data,
            }));
        } catch (error) {
            console.error(
                "Failed to get assignment recommendation:",
                error,
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to get assignment recommendation.",
            );
        } finally {
            setLoadingRecommendation(null);
        }
    }

    // Handle Assigning Recommended Assignee
    async function handleAssignRecommended(
        taskId: string,
        memberId: string,
    ) {
        if (!sprint) return;

        try {
            setActionError(null);

            const response = await fetch(
                `/api/sprints/${sprint.id}/tasks/${taskId}/assignment`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ memberId }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to assign task.",
                );
            }

            setSprint((currentSprint) =>
                currentSprint
                    ? {
                        ...currentSprint,
                        tasks: currentSprint.tasks.map((task) =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    assignedTo:
                                        result.data.assignedTo,
                                }
                                : task,
                        ),
                    }
                    : currentSprint,
            );
        } catch (error) {
            console.error("Failed to assign task:", error);

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to assign task.",
            );
        }
    }

    // Handle Manual Assignment
    async function handleManualAssignment(
        taskId: string,
        memberId: string,
    ) {
        if (!sprint) return;

        try {
            setActionError(null);

            const response = await fetch(
                `/api/sprints/${sprint.id}/tasks/${taskId}/assignment`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ memberId }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to assign task.",
                );
            }

            setSprint((currentSprint) =>
                currentSprint
                    ? {
                        ...currentSprint,
                        tasks: currentSprint.tasks.map((task) =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    assignedTo:
                                        result.data.assignedTo,
                                }
                                : task,
                        ),
                    }
                    : currentSprint,
            );
        } catch (error) {
            console.error(
                "Failed to manually assign task:",
                error,
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to assign task.",
            );
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <p className="text-sm text-muted">Loading sprint...</p>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <p className="alert-error">{error}</p>
            </PageContainer>
        );
    }

    if (!sprint) {
        return (
            <PageContainer>
                <p className="empty-state">Sprint not found.</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title={sprint.name}
                description={sprint.goal}
                action={
                    <div className="flex items-center gap-3">
                        <span
                            className={`badge ${sprintStatusStyles[sprint.status]}`}
                        >
                            {sprint.status}
                        </span>

                        {sprint.status === "PLANNED" && (
                            <button
                                type="button"
                                onClick={handleActivateSprint}
                                disabled={isActivating}
                                className="btn-primary"
                            >
                                {isActivating
                                    ? "Activating..."
                                    : "Activate Sprint"}
                            </button>
                        )}
                    </div>
                }
            />

            <div className="-mt-4 mb-8 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                <span>
                    {formatDate(sprint.startDate)} →{" "}
                    {formatDate(sprint.endDate)}
                </span>

                <span>{sprint.totalEstimatedHours} hours</span>
            </div>

            {actionError && (
                <p className="alert-error mb-6" role="alert">
                    {actionError}
                </p>
            )}

            {progress && (
                <section className="card">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Sprint Progress
                        </h2>

                        <span className="text-2xl font-semibold">
                            {progress.progressPercentage}%
                        </span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-brand-soft">
                        <div
                            className="h-full rounded-full bg-brand"
                            style={{
                                width: `${progress.progressPercentage}%`,
                            }}
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                            <p className="text-muted">To Do</p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.todoTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted">In Progress</p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.inProgressTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted">Done</p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.doneTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted">Blocked</p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.blockedTasks}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Tasks Section */}
            <section className="mt-10">
                <h2 className="text-xl font-semibold">Tasks</h2>

                <div className="mt-4 space-y-4">
                    {sprint.tasks.map((task) => (
                        <article key={task.id} className="card">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted">
                                        {task.taskId}
                                    </p>

                                    <h3 className="mt-1 text-lg font-semibold">
                                        {task.title}
                                    </h3>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`badge ${complexityStyles[task.complexity]}`}
                                    >
                                        {task.complexity}
                                    </span>

                                    <select
                                        value={task.status}
                                        onChange={(event) =>
                                            handleTaskStatusChange(
                                                task.id,
                                                event.target.value as Task["status"],
                                            )
                                        }
                                        aria-label="Task status"
                                        className="input w-auto py-1"
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="DONE">DONE</option>
                                        <option value="BLOCKED">BLOCKED</option>
                                    </select>
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-muted">
                                {task.description}
                            </p>

                            <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs font-semibold text-muted">
                                        Skills
                                    </p>

                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {task.skills.map((skill) => (
                                            <span
                                                key={skill.id}
                                                className="badge badge-brand"
                                            >
                                                {skill.skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-muted">
                                        Assigned To
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {task.assignedTo
                                            ? `${task.assignedTo.name} (${task.assignedTo.role})`
                                            : "Unassigned"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-muted">
                                        Estimated Hours
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {task.estimatedHours} hours
                                    </p>
                                </div>
                            </div>

                            {task.dependencies.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-muted">
                                        Dependencies
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {task.dependencies
                                            .map(
                                                (dependency) =>
                                                    `${dependency.dependsOn.taskId} - ${dependency.dependsOn.title}`,
                                            )
                                            .join(", ")}
                                    </p>
                                </div>
                            )}

                            {/* Assignment */}
                            <div className="mt-5 rounded-lg bg-canvas p-4">
                                <div className="flex flex-wrap items-end gap-3">
                                    <div className="min-w-48 flex-1">
                                        <label
                                            htmlFor={`assign-${task.id}`}
                                            className="label"
                                        >
                                            Assign Manually
                                        </label>

                                        <select
                                            id={`assign-${task.id}`}
                                            value={task.assignedTo?.id ?? ""}
                                            onChange={(event) => {
                                                const memberId = event.target.value;

                                                if (memberId) {
                                                    handleManualAssignment(task.id, memberId);
                                                }
                                            }}
                                            className="input"
                                        >
                                            <option value="">Select team member</option>

                                            {teamMembers.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} ({member.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRecommendAssignee(task.id)}
                                        disabled={loadingRecommendation === task.id}
                                        className="btn-secondary"
                                    >
                                        {loadingRecommendation === task.id
                                            ? "Finding..."
                                            : "Recommend Assignee"}
                                    </button>
                                </div>

                                {recommendations[task.id]?.recommendedMember && (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-soft p-4">
                                        <div>
                                            <p className="text-xs font-semibold text-muted">
                                                Recommended Assignee
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {recommendations[task.id].recommendedMember?.name}
                                                {" "}
                                                ({recommendations[task.id].recommendedMember?.role})
                                            </p>

                                            <p className="mt-1 text-sm text-muted">
                                                Skill Match:{" "}
                                                {recommendations[task.id].recommendedMember?.matchPercentage}%
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const recommendedMember =
                                                    recommendations[task.id]?.recommendedMember;

                                                if (recommendedMember) {
                                                    handleAssignRecommended(
                                                        task.id,
                                                        recommendedMember.memberId,
                                                    );
                                                }
                                            }}
                                            className="btn-primary"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Documentation Section */}
            <section className="mt-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Documentation</h2>

                    <div className="flex items-center gap-3">
                        <span className="badge badge-brand">
                            {documents.length}{" "}
                            {documents.length === 1 ? "Document" : "Documents"}
                        </span>

                        <button
                            type="button"
                            onClick={() => setIsDocumentFormOpen(true)}
                            className="btn-primary"
                        >
                            Add Document
                        </button>
                    </div>
                </div>

                {isDocumentFormOpen && (
                    <AddDocumentModal
                        sprintId={sprint.id}
                        onClose={() => setIsDocumentFormOpen(false)}
                        onCreated={(document) =>
                            setDocuments((current) => [document, ...current])
                        }
                    />
                )}

                {documents.length === 0 ? (
                    <p className="empty-state mt-4">
                        No documentation has been added to this sprint yet.
                    </p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {documents.map((document) => (
                            <article key={document.id} className="card">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {document.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted">
                                            {document.type}
                                        </p>
                                    </div>

                                    <span className="badge badge-brand">
                                        {document.sourceType}
                                    </span>
                                </div>

                                {document.sourceType === "DOCUMENT" &&
                                    document.content && (
                                        <p className="mt-4 text-sm whitespace-pre-wrap text-muted">
                                            {document.content}
                                        </p>
                                    )}

                                {document.sourceType === "LINK" &&
                                    document.url && (
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 block text-sm break-all text-brand-strong underline"
                                        >
                                            {document.url}
                                        </a>
                                    )}

                                {document.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {document.tags.map(({ tag }) => (
                                            <span
                                                key={tag.id}
                                                className="badge badge-muted"
                                            >
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </PageContainer>
    );
}
