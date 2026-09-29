"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format-date";
import AddTaskForm from "@/components/tasklist/AddTaskForm";
import DaySummary from "@/components/tasklist/DaySummary";
import TaskCard from "@/components/tasklist/TaskCard";
import {
    getPlannedMins,
    type Snapshot,
    type Task,
    type Tasklist,
} from "@/components/tasklist/shared";

type TeamMember = {
    id: string;
    name: string;
    role: string;
};

export default function TasklistPage() {
    const [tasklist, setTasklist] = useState<Tasklist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isCapturingSod, setIsCapturingSod] = useState(false);
    const [isCapturingEod, setIsCapturingEod] = useState(false);
    const [availableHours, setAvailableHours] = useState("8");

    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await fetch("/api/team-members");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch team members.",
                    );
                }

                setMembers(result.data);

                if (result.data.length > 0) {
                    setMemberId(result.data[0].id);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch team members:", error);
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch team members.",
                );
                setIsLoading(false);
            }
        }

        fetchMembers();
    }, []);

    useEffect(() => {
        if (!memberId) return;

        let cancelled = false;

        async function fetchTasklist() {
            try {
                const date = new Date().toISOString().split("T")[0];

                const response = await fetch(
                    `/api/tasklists?memberId=${memberId}&date=${date}`,
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch tasklist.",
                    );
                }

                if (cancelled) return;

                if (!result.data) {
                    setTasklist(null);
                    return;
                }

                setTasklist(result.data);

                const snapshotsResponse = await fetch(
                    `/api/tasklists/${result.data.id}`,
                );

                const snapshotsResult = await snapshotsResponse.json();

                if (!cancelled && snapshotsResponse.ok) {
                    setSnapshots(snapshotsResult.data.snapshots);
                }
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to fetch tasklist:", error);
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch tasklist.",
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchTasklist();

        return () => {
            cancelled = true;
        };
    }, [memberId]);

    function handleMemberChange(id: string) {
        setMemberId(id);
        setTasklist(null);
        setSnapshots([]);
        setLoadError(null);
        setIsLoading(true);
    }

    function showNotice(type: "success" | "error", message: string) {
        setNotice({ type, message });
    }

    function updateTasks(update: (tasks: Task[]) => Task[]) {
        setTasklist((current) =>
            current ? { ...current, tasks: update(current.tasks) } : current,
        );
    }

    function handleTaskCreated(task: Task) {
        updateTasks((tasks) => [...tasks, task]);
    }

    function handleTaskUpdated(task: Task) {
        updateTasks((tasks) =>
            tasks.map((item) => (item.id === task.id ? task : item)),
        );
    }

    // Deleting a task also removes its subtasks.
    function handleTaskDeleted(taskId: string) {
        updateTasks((tasks) =>
            tasks.filter(
                (item) => item.id !== taskId && item.parentTaskId !== taskId,
            ),
        );
    }

    async function handleCapture(action: "SOD" | "EOD") {
        if (!tasklist) return;

        const setCapturing =
            action === "SOD" ? setIsCapturingSod : setIsCapturingEod;

        try {
            setCapturing(true);

            const response = await fetch(`/api/tasklists/${tasklist.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to capture ${action}.`);
            }

            setTasklist((current) =>
                current ? { ...current, ...result.data } : current,
            );

            showNotice("success", `${action} captured successfully.`);
        } catch (error) {
            console.error(`Failed to capture ${action}:`, error);
            showNotice("error", `Failed to capture ${action}.`);
        } finally {
            setCapturing(false);
        }
    }

    useEffect(() => {
        if (!notice) return;

        const timer = setTimeout(() => setNotice(null), 5000);

        return () => clearTimeout(timer);
    }, [notice]);

    const memberPicker =
        members.length > 0 ? (
            <div className="mb-6 max-w-xs">
                <label htmlFor="member-select" className="label">
                    Team member
                </label>
                <select
                    id="member-select"
                    className="input"
                    value={memberId ?? ""}
                    onChange={(event) =>
                        handleMemberChange(event.target.value)
                    }
                >
                    {members.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>
        ) : null;

    if (isLoading) {
        return (
            <PageContainer>
                {memberPicker}
                <p className="text-sm text-muted">Loading tasklist...</p>
            </PageContainer>
        );
    }

    if (loadError) {
        return (
            <PageContainer>
                {memberPicker}
                <PageHeader title="My Tasklist" />

                <p className="alert-error" role="alert">
                    {loadError}
                </p>
            </PageContainer>
        );
    }

    if (members.length === 0) {
        return (
            <PageContainer>
                <PageHeader title="My Tasklist" />

                <p className="empty-state">
                    No team members yet. Add one on the Team page first.
                </p>
            </PageContainer>
        );
    }

    if (!tasklist) {
        return (
            <PageContainer>
                {memberPicker}
                <PageHeader title="My Tasklist" />

                <p className="empty-state">
                    No tasklist has been created for today.
                </p>
            </PageContainer>
        );
    }

    const parentTasks = tasklist.tasks
        .filter((task) => !task.parentTaskId)
        .sort((a, b) => a.order - b.order);

    const totalPlannedMins = parentTasks.reduce(
        (total, task) =>
            total +
            getPlannedMins(
                task,
                tasklist.tasks.filter(
                    (subtask) => subtask.parentTaskId === task.id,
                ),
            ),
        0,
    );

    const totalPlannedHours = Math.floor(totalPlannedMins / 60);
    const totalPlannedRemainingMins = totalPlannedMins % 60;

    const availableMins = Number(availableHours) * 60;
    const remainingMins = availableMins - totalPlannedMins;

    const isOverCapacity = remainingMins < 0;
    const capacityHours = Math.floor(Math.abs(remainingMins) / 60);
    const capacityMinutes = Math.abs(remainingMins) % 60;

    const isLocked = !!tasklist.eodCapturedAt;

    return (
        <PageContainer>
            {notice && (
                <div
                    role={notice.type === "error" ? "alert" : "status"}
                    className={`fixed right-4 top-20 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
                        notice.type === "success"
                            ? "border-brand bg-brand-soft text-brand-strong"
                            : "border-red-200 bg-red-50 text-red-700"
                    }`}
                >
                    {notice.message}
                </div>
            )}

            {memberPicker}
            <PageHeader
                title="My Tasklist"
                description={`${tasklist.member.name} · ${tasklist.member.role}`}
                action={
                    <div className="text-right">
                        <p className="text-sm font-medium">
                            {formatDate(tasklist.date)}
                        </p>

                        <p className="text-xs text-muted">
                            {tasklist.status}
                        </p>

                        <div className="mt-2 flex justify-end gap-2">
                            <span
                                className={`badge ${tasklist.sodCapturedAt ? "badge-brand" : "badge-muted"}`}
                            >
                                SOD {tasklist.sodCapturedAt ? "✓" : "—"}
                            </span>

                            <span
                                className={`badge ${tasklist.eodCapturedAt ? "badge-brand" : "badge-muted"}`}
                            >
                                EOD {tasklist.eodCapturedAt ? "✓" : "—"}
                            </span>
                        </div>
                    </div>
                }
            />

            <section className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Today&apos;s Tasks
                        </h2>

                        <div className="mt-1 flex items-center gap-4 text-sm">
                            <span className="text-muted">
                                Planned:{" "}
                                {totalPlannedHours > 0 &&
                                    `${totalPlannedHours}h `}
                                {totalPlannedRemainingMins > 0 &&
                                    `${totalPlannedRemainingMins}m`}
                                {totalPlannedMins === 0 && "0m"}
                            </span>

                            <label className="flex items-center gap-2 text-muted">
                                Available:
                                <input
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    value={availableHours}
                                    onChange={(event) =>
                                        setAvailableHours(event.target.value)
                                    }
                                    className="input w-16 px-2 py-1 text-center"
                                />
                                h
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">
                            {tasklist.tasks.length} tasks
                        </span>

                        {/* SOD - Start of Day button */}
                        <button
                            type="button"
                            disabled={isCapturingSod || !!tasklist.sodCapturedAt}
                            onClick={() => handleCapture("SOD")}
                            className="btn-secondary"
                        >
                            {isCapturingSod
                                ? "Capturing..."
                                : tasklist.sodCapturedAt
                                    ? "SOD Captured"
                                    : "Start Day"}
                        </button>

                        {/* EOD - End of Day button */}
                        <button
                            type="button"
                            disabled={isCapturingEod || isLocked}
                            onClick={() => handleCapture("EOD")}
                            className="btn-secondary"
                        >
                            {isCapturingEod
                                ? "Capturing..."
                                : isLocked
                                    ? "EOD Captured"
                                    : "End Day"}
                        </button>

                        {/* Add Task button */}
                        <button
                            type="button"
                            onClick={() => setIsAddingTask(true)}
                            disabled={isLocked}
                            className="btn-primary"
                        >
                            + Add Task
                        </button>
                    </div>
                </div>

                <div
                    className={`mt-4 rounded-lg px-4 py-3 text-sm ${isOverCapacity
                        ? "bg-red-50 text-red-700"
                        : "bg-brand-soft text-brand-strong"
                        }`}
                >
                    {isOverCapacity ? "Over capacity by" : "Remaining capacity:"}{" "}
                    <strong>
                        {capacityHours > 0 && `${capacityHours}h `}
                        {capacityMinutes > 0 && `${capacityMinutes}m`}
                    </strong>
                </div>

                {snapshots.length > 0 && <DaySummary snapshots={snapshots} />}

                {isAddingTask && (
                    <AddTaskForm
                        tasklistId={tasklist.id}
                        nextOrder={parentTasks.length + 1}
                        onCreated={(task) => {
                            handleTaskCreated(task);
                            setIsAddingTask(false);
                        }}
                        onCancel={() => setIsAddingTask(false)}
                        onError={(message) => showNotice("error", message)}
                    />
                )}

                {tasklist.tasks.length === 0 ? (
                    <p className="empty-state mt-6">No tasks added yet.</p>
                ) : (
                    <div className="mt-6 space-y-3">
                        {parentTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                tasklistId={tasklist.id}
                                task={task}
                                subtasks={tasklist.tasks.filter(
                                    (subtask) =>
                                        subtask.parentTaskId === task.id,
                                )}
                                locked={isLocked}
                                onCreated={handleTaskCreated}
                                onUpdated={handleTaskUpdated}
                                onDeleted={handleTaskDeleted}
                                onError={(message) =>
                                    showNotice("error", message)
                                }
                            />
                        ))}
                    </div>
                )}
            </section>
        </PageContainer>
    );
}
