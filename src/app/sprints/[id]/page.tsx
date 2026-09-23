"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";

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

type Document = {
    id: string;
    title: string;
    type: string;
    sourceType: "DOCUMENT" | "LINK" | "UPLOAD";
    content: string | null;
    url: string | null;
    source: "MANUAL" | "AI_GENERATED";
    createdAt: string;
    tags: {
        tag: {
            id: string;
            name: string;
        };
    }[];
};

type TeamMember = {
    id: string;
    name: string;
    role: string;
};

export default function SprintDetailPage() {
    // States
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [progress, setProgress] = useState<SprintProgress | null>(null);
    const [recommendations, setRecommendations] = useState<Record<string, AssignmentRecommendation>>({});
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // Dcocumentation States
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [documentTitle, setDocumentTitle] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documentSourceType, setDocumentSourceType] = useState<"DOCUMENT" | "LINK" | "UPLOAD">("DOCUMENT");
    const [documentContent, setDocumentContent] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [documentTags, setDocumentTags] = useState("");
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);

    // Loading & Errors
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingRecommendation, setLoadingRecommendation] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        async function fetchSprint() {
            try {
                const sprintId =
                    window.location.pathname.split("/").pop();

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
    }, []);

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
            setError(null);

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

            setError(
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

            setError(
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
            setError(null);

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

            setError(
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
            setError(null);

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

            setError(
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
            setError(null);

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

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to assign task.",
            );
        }
    }

    // Handle Create Document
    const handleCreateDocument = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!sprint) {
            alert("Sprint details are not available.");
            return;
        }

        if (documentSourceType === "UPLOAD" && !documentFile) {
            alert("Please select a document to upload.");
            return;
        }

        setIsCreatingDocument(true);

        try {
            const formData = new FormData();

            formData.append("title", documentTitle);
            formData.append("type", documentType);
            formData.append("sourceType", documentSourceType);
            formData.append("sprintId", sprint.id);
            formData.append("tagNames", documentTags);

            if (documentSourceType === "DOCUMENT") {
                formData.append("content", documentContent);
            }

            if (documentSourceType === "LINK") {
                formData.append("url", documentUrl);
            }

            if (documentSourceType === "UPLOAD" && documentFile) {
                formData.append("file", documentFile);
            }

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to create document.",
                );
            }

            setDocuments((current) => [result.data, ...current]);

            setDocumentTitle("");
            setDocumentType("");
            setDocumentSourceType("DOCUMENT");
            setDocumentContent("");
            setDocumentUrl("");
            setDocumentTags("");
            setDocumentFile(null);
            setIsDocumentFormOpen(false);
        } catch (error) {
            console.error("Failed to create document:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create document.",
            );
        } finally {
            setIsCreatingDocument(false);
        }
    };

    if (isLoading) {
        return <main className="p-8">Loading sprint...</main>;
    }

    if (error) {
        return (
            <main className="p-8 text-red-600">
                {error}
            </main>
        );
    }

    if (!sprint) {
        return <main className="p-8">Sprint not found.</main>;
    }

    return (
        <PageContainer>
            <h1 className="text-3xl font-semibold">
                {sprint.name}
            </h1>

            <p className="mt-2 text-[#5F6B64]">
                {sprint.goal}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <span>
                    {new Date(
                        sprint.startDate,
                    ).toLocaleDateString()}{" "}
                    →{" "}
                    {new Date(
                        sprint.endDate,
                    ).toLocaleDateString()}
                </span>

                <span>
                    {sprint.totalEstimatedHours} hours
                </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
                <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-sm font-medium">
                    {sprint.status}
                </span>

                {sprint.status === "PLANNED" && (
                    <button
                        type="button"
                        onClick={handleActivateSprint}
                        disabled={isActivating}
                        className="rounded-xl bg-[#8CC9A8] px-4 py-2 text-sm font-medium text-[#1F2924] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isActivating ? "Activating..." : "Activate Sprint"}
                    </button>
                )}
            </div>

            {progress && (
                <section className="mt-8 rounded-2xl border border-[#DDE8E1] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Sprint Progress
                        </h2>

                        <span className="text-2xl font-semibold">
                            {progress.progressPercentage}%
                        </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E8F6EF]">
                        <div
                            className="h-full rounded-full bg-[#8CC9A8]"
                            style={{
                                width: `${progress.progressPercentage}%`,
                            }}
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                            <p className="text-[#5F6B64]">
                                To Do
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.todoTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#5F6B64]">
                                In Progress
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.inProgressTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#5F6B64]">
                                Done
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.doneTasks}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#5F6B64]">
                                Blocked
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {progress.blockedTasks}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            <section className="mt-10">
                <h2 className="text-2xl font-semibold">
                    Tasks
                </h2>

                {/* Documentation Section */}
                <div className="mt-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-2xl font-semibold">
                            Documentation
                        </h2>

                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-sm font-medium">
                                {documents.length}{" "}
                                {documents.length === 1 ? "Document" : "Documents"}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsDocumentFormOpen((current) => !current)
                                }
                                className="rounded-xl bg-[#8CC9A8] px-4 py-2 text-sm font-medium text-[#1F2924] transition hover:opacity-90"
                            >
                                Add Document
                            </button>
                        </div>
                    </div>

                    {isDocumentFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-[#1F2924]">
                                        Add Document
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() => setIsDocumentFormOpen(false)}
                                        className="text-2xl text-gray-500 transition hover:text-gray-800"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className="mb-6 text-sm text-gray-500">
                                    Add documentation or an external reference to this sprint.
                                </p>

                                <form
                                    onSubmit={handleCreateDocument}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Document Title
                                        </label>

                                        <input
                                            type="text"
                                            value={documentTitle}
                                            onChange={(event) =>
                                                setDocumentTitle(event.target.value)
                                            }
                                            placeholder="e.g. Sprint Requirements"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Document Type
                                        </label>

                                        <input
                                            type="text"
                                            value={documentType}
                                            onChange={(event) =>
                                                setDocumentType(event.target.value)
                                            }
                                            placeholder="e.g. Requirements, Design, Meeting Notes"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Source Type
                                        </label>

                                        <select
                                            value={documentSourceType}
                                            onChange={(event) =>
                                                setDocumentSourceType(
                                                    event.target.value as
                                                    | "DOCUMENT"
                                                    | "LINK"
                                                    | "UPLOAD",
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                        >
                                            <option value="DOCUMENT">Document Content</option>
                                            <option value="LINK">External Link</option>
                                            <option value="UPLOAD">Upload Document</option>
                                        </select>
                                    </div>

                                    {documentSourceType === "DOCUMENT" ? (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Content
                                            </label>

                                            <textarea
                                                value={documentContent}
                                                onChange={(event) =>
                                                    setDocumentContent(event.target.value)
                                                }
                                                placeholder="Write or paste the document content..."
                                                rows={6}
                                                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                                required
                                            />
                                        </div>
                                    ) : documentSourceType === "LINK" ? (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Document URL
                                            </label>

                                            <input
                                                type="url"
                                                value={documentUrl}
                                                onChange={(event) =>
                                                    setDocumentUrl(event.target.value)
                                                }
                                                placeholder="https://example.com/document"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Upload Document
                                            </label>

                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.md"
                                                onChange={(event) =>
                                                    setDocumentFile(event.target.files?.[0] ?? null)
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#E8F6EF] file:px-4 file:py-2 file:text-sm file:font-medium"
                                                required
                                            />

                                            <p className="mt-1 text-xs text-gray-500">
                                                Supported formats: PDF, DOC, DOCX, TXT, and Markdown.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Tags
                                        </label>

                                        <input
                                            type="text"
                                            value={documentTags}
                                            onChange={(event) =>
                                                setDocumentTags(event.target.value)
                                            }
                                            placeholder="frontend, api, planning"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                        />

                                        <p className="mt-1 text-xs text-gray-500">
                                            Separate multiple tags using commas.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsDocumentFormOpen(false)}
                                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isCreatingDocument}
                                            className="rounded-xl bg-[#8CC9A8] px-5 py-2.5 text-sm font-medium text-[#1F2924] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isCreatingDocument ? "Saving..." : "Save Document"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {documents.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-[#DDE8E1] bg-white p-6 text-sm text-[#5F6B64]">
                            No documentation has been added to this sprint yet.
                        </div>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {documents.map((document) => (
                                <article
                                    key={document.id}
                                    className="rounded-2xl border border-[#DDE8E1] bg-white p-6 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {document.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-[#5F6B64]">
                                                {document.type}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-xs font-medium">
                                            {document.sourceType}
                                        </span>
                                    </div>

                                    {document.sourceType === "DOCUMENT" &&
                                        document.content && (
                                            <p className="mt-4 whitespace-pre-wrap text-sm text-[#5F6B64]">
                                                {document.content}
                                            </p>
                                        )}

                                    {document.sourceType === "LINK" &&
                                        document.url && (
                                            <a
                                                href={document.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 block break-all text-sm text-[#397A59] underline"
                                            >
                                                {document.url}
                                            </a>
                                        )}

                                    {document.tags.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {document.tags.map(({ tag }) => (
                                                <span
                                                    key={tag.id}
                                                    className="rounded-full bg-[#F8F7F2] px-3 py-1 text-xs text-[#5F6B64]"
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
                </div>


                <div className="mt-5 space-y-4">
                    {sprint.tasks.map((task) => (
                        <article
                            key={task.id}
                            className="rounded-2xl border border-[#DDE8E1] bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-[#5F6B64]">
                                        {task.taskId}
                                    </p>

                                    <h3 className="mt-1 text-xl font-semibold">
                                        {task.title}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-sm">
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
                                        className="rounded-xl border border-[#DDE8E1] bg-white px-3 py-1 text-sm outline-none"
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="DONE">DONE</option>
                                        <option value="BLOCKED">BLOCKED</option>
                                    </select>
                                </div>
                            </div>

                            <p className="mt-3 text-[#5F6B64]">
                                {task.description}
                            </p>

                            <div className="mt-4">
                                <p className="text-sm font-medium">
                                    Skills
                                </p>

                                <p className="mt-1 text-sm text-[#5F6B64]">
                                    {task.skills
                                        .map((skill) => skill.skill)
                                        .join(", ")}
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-medium">
                                    Assigned To
                                </p>

                                <p className="mt-1 text-sm text-[#5F6B64]">
                                    {task.assignedTo
                                        ? `${task.assignedTo.name} (${task.assignedTo.role})`
                                        : "Unassigned"}
                                </p>
                            </div>

                            <div className="mt-3">
                                <label
                                    htmlFor={`assign-${task.id}`}
                                    className="text-sm font-medium"
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
                                    className="mt-1 w-full rounded-xl border border-[#DDE8E1] bg-white px-3 py-2 text-sm outline-none"
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
                                className="mt-3 rounded-xl border border-[#DDE8E1] px-3 py-2 text-sm font-medium transition hover:bg-[#E8F6EF] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loadingRecommendation === task.id
                                    ? "Finding..."
                                    : "Recommend Assignee"}
                            </button>

                            {recommendations[task.id]?.recommendedMember && (
                                <div className="mt-3 rounded-xl bg-[#F8F7F2] p-4">
                                    <p className="text-sm font-medium">
                                        Recommended Assignee
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {recommendations[task.id].recommendedMember?.name}
                                        {" "}
                                        ({recommendations[task.id].recommendedMember?.role})
                                    </p>

                                    <p className="mt-1 text-sm text-[#5F6B64]">
                                        Skill Match:{" "}
                                        {recommendations[task.id].recommendedMember?.matchPercentage}%
                                    </p>

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
                                        className="mt-3 rounded-xl bg-[#8CC9A8] px-3 py-2 text-sm font-medium text-[#1F2924] transition hover:opacity-90"
                                    >
                                        Assign
                                    </button>
                                </div>
                            )}

                            <div className="mt-4">
                                <p className="text-sm font-medium">
                                    Estimated Hours
                                </p>

                                <p className="mt-1 text-sm text-[#5F6B64]">
                                    {task.estimatedHours} hours
                                </p>
                            </div>

                            {task.dependencies.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium">
                                        Dependencies
                                    </p>

                                    <p className="mt-1 text-sm text-[#5F6B64]">
                                        {task.dependencies
                                            .map(
                                                (dependency) =>
                                                    `${dependency.dependsOn.taskId} - ${dependency.dependsOn.title}`,
                                            )
                                            .join(", ")}
                                    </p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </PageContainer >
    );
}
