"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatDate, toLocalDateString } from "@/lib/format-date";
import AddTaskForm from "@/components/tasklist/AddTaskForm";
import DaySummary from "@/components/tasklist/DaySummary";
import EndDayModal from "@/components/tasklist/EndDayModal";
import TaskCard from "@/components/tasklist/TaskCard";
import {
    carryOverTasks,
    fetchSnapshots,
    fetchSprintTaskOptions,
    startDay,
    type EndDayEntry,
    type EndDayResult,
} from "@/components/tasklist/api";
import {
    formatMinutes,
    getPlannedMins,
    groupTasksByFeature,
    type Snapshot,
    type SprintTaskOption,
    type Task,
    type Tasklist,
} from "@/components/tasklist/shared";

type TeamMember = {
    id: string;
    name: string;
    role: string;
    isActive: boolean;
};

type CurrentMember = {
    id: string;
    name: string;
    accessRole: "SCRUM_MASTER" | "MEMBER";
};

const statusLabels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
    BLOCKED: "Blocked",
};

// "Day ended. TASK-003 is now In Progress. TASK-007: time saved, ..."
function describeEndDay(result: EndDayResult) {
    const parts = ["Day ended."];

    for (const change of result.sprintTaskChanges) {
        parts.push(
            change.to === "DONE"
                ? `${change.taskId} is marked done.`
                : `${change.taskId} is now ${statusLabels[change.to] ?? change.to}.`,
        );
    }

    for (const skipped of result.skippedSprintTaskChanges) {
        const reason =
            skipped.reason === "SPRINT_ENDED"
                ? "its sprint has ended"
                : "it is no longer assigned to you";

        parts.push(
            `${skipped.taskId}: time saved, but its status was not changed because ${reason}.`,
        );
    }

    return parts.join(" ");
}

export default function TasklistPage() {
    const [tasklist, setTasklist] = useState<Tasklist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [currentMember, setCurrentMember] = useState<CurrentMember | null>(null);
    // Filled for the Scrum Master only, for the member picker.
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [memberId, setMemberId] = useState<string | null>(null);
    // Bumped to load the tasklist again, e.g. after creating it.
    const [reloadKey, setReloadKey] = useState(0);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isCreatingTasklist, setIsCreatingTasklist] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCapturingSod, setIsCapturingSod] = useState(false);
    const [isEndDayOpen, setIsEndDayOpen] = useState(false);
    const [availableHours, setAvailableHours] = useState("8");
    const [sprintTaskOptions, setSprintTaskOptions] = useState<SprintTaskOption[]>([]);
    const [isCarryingOver, setIsCarryingOver] = useState(false);
    const [groupByFeature, setGroupByFeature] = useState(false);

    // Everyone starts on their own list. Only the Scrum Master can open
    // someone else's, and only to read it.
    useEffect(() => {
        async function fetchCurrentMember() {
            try {
                const response = await fetch("/api/auth/me");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to load your account.");
                }

                const me: CurrentMember = result.data.member;

                setCurrentMember(me);
                setMemberId(me.id);

                if (me.accessRole === "SCRUM_MASTER") {
                    const membersResponse = await fetch("/api/team-members");
                    const membersResult = await membersResponse.json();

                    if (membersResponse.ok) {
                        setMembers(membersResult.data);
                    }
                }
            } catch (error) {
                console.error("Failed to load the signed-in member:", error);
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load your account.",
                );
                setIsLoading(false);
            }
        }

        fetchCurrentMember();
    }, []);

    useEffect(() => {
        if (!memberId) return;

        let cancelled = false;

        async function fetchTasklist() {
            try {
                const date = toLocalDateString();

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
    }, [memberId, reloadKey]);

    // The sprint tasks the signed-in member can link their own tasks to.
    const tasklistId = tasklist?.id;
    const isOwnList = memberId !== null && memberId === currentMember?.id;

    useEffect(() => {
        if (!tasklistId || !isOwnList) return;

        let cancelled = false;

        fetchSprintTaskOptions()
            .then((options) => {
                if (!cancelled) setSprintTaskOptions(options);
            })
            .catch((error) => {
                console.error("Failed to load your sprint tasks:", error);
            });

        return () => {
            cancelled = true;
        };
    }, [tasklistId, isOwnList]);

    function handleMemberChange(id: string) {
        setMemberId(id);
        setTasklist(null);
        setSnapshots([]);
        setLoadError(null);
        setCreateError(null);
        setIsAddingTask(false);
        setIsLoading(true);
    }

    async function handleCreateTasklist() {
        setCreateError(null);
        setIsCreatingTasklist(true);

        try {
            // The API always creates the list for the signed-in member.
            const response = await fetch("/api/tasklists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ date: toLocalDateString() }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create tasklist.");
            }

            setIsLoading(true);
            setReloadKey((key) => key + 1);
        } catch (error) {
            console.error("Failed to create tasklist:", error);
            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create tasklist.",
            );
        } finally {
            setIsCreatingTasklist(false);
        }
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

    // Copies the unfinished tasks of the previous tasklist into this one.
    async function handleCarryOver() {
        if (!tasklist) return;

        try {
            setIsCarryingOver(true);

            const result = await carryOverTasks(tasklist.id);

            if (!result.fromDate) {
                showNotice("success", "There is no earlier tasklist to carry over from.");
                return;
            }

            const from = formatDate(result.fromDate);
            const carried = result.tasks.filter((task) => !task.parentTaskId).length;

            if (carried === 0) {
                showNotice("success", `Nothing left to carry over from ${from}.`);
                return;
            }

            updateTasks((tasks) => [...tasks, ...result.tasks]);

            const dropped =
                result.droppedLinks > 0
                    ? ` ${result.droppedLinks} sprint ${result.droppedLinks === 1 ? "link was" : "links were"} removed: that sprint task is no longer open to you.`
                    : "";

            showNotice(
                "success",
                `Carried over ${carried} unfinished ${carried === 1 ? "task" : "tasks"} from ${from}.${dropped}`,
            );
        } catch (error) {
            console.error("Failed to carry over tasks:", error);
            showNotice(
                "error",
                error instanceof Error ? error.message : "Failed to carry over tasks.",
            );
        } finally {
            setIsCarryingOver(false);
        }
    }

    // The day summary compares the Start Day and End Day snapshots.
    async function reloadSnapshots(tasklistId: string) {
        try {
            setSnapshots(await fetchSnapshots(tasklistId));
        } catch (error) {
            console.error("Failed to reload snapshots:", error);
        }
    }

    async function handleStartDay() {
        if (!tasklist) return;

        try {
            setIsCapturingSod(true);

            const result = await startDay(tasklist.id);

            setTasklist((current) =>
                current
                    ? { ...current, sodCapturedAt: result.tasklist.sodCapturedAt }
                    : current,
            );

            showNotice("success", "SOD captured successfully.");
            reloadSnapshots(tasklist.id);
        } catch (error) {
            console.error("Failed to capture SOD:", error);
            showNotice(
                "error",
                error instanceof Error ? error.message : "Failed to capture SOD.",
            );
        } finally {
            setIsCapturingSod(false);
        }
    }

    // End Day saved the time spent and may have moved linked sprint tasks.
    function handleDayEnded(result: EndDayResult, entries: EndDayEntry[]) {
        const spentByTask = new Map(
            entries.map((entry) => [entry.taskId, entry.spentMins]),
        );
        const newStatus = new Map(
            result.sprintTaskChanges.map((change) => [
                change.sprintTaskId,
                change.to,
            ]),
        );

        setTasklist((current) =>
            current
                ? {
                    ...current,
                    eodCapturedAt: result.tasklist.eodCapturedAt,
                    tasks: current.tasks.map((task) => ({
                        ...task,
                        ...(spentByTask.has(task.id) && {
                            spentMins: spentByTask.get(task.id),
                        }),
                        ...(task.sprintTask &&
                            newStatus.has(task.sprintTask.id) && {
                            sprintTask: {
                                ...task.sprintTask,
                                status:
                                    newStatus.get(task.sprintTask.id) ??
                                    task.sprintTask.status,
                            },
                        }),
                    })),
                }
                : current,
        );

        setIsEndDayOpen(false);
        showNotice("success", describeEndDay(result));

        if (tasklist) {
            reloadSnapshots(tasklist.id);
        }
    }

    useEffect(() => {
        if (!notice) return;

        // Longer messages (End Day notes) stay up a little longer.
        const timer = setTimeout(
            () => setNotice(null),
            notice.message.length > 80 ? 10000 : 5000,
        );

        return () => clearTimeout(timer);
    }, [notice]);

    const viewedMemberName =
        tasklist?.member.name ??
        members.find((member) => member.id === memberId)?.name ??
        "This member";
    const pageTitle = isOwnList ? "My Tasklist" : `${viewedMemberName}'s Tasklist`;

    const memberPicker =
        currentMember?.accessRole === "SCRUM_MASTER" && members.length > 1 ? (
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
                            {member.id === currentMember.id && " (you)"}
                            {!member.isActive && " - deactivated"}
                        </option>
                    ))}
                </select>

                {!isOwnList && (
                    <p className="hint">
                        Read only: you can view other members&apos; tasklists
                        but not change them.
                    </p>
                )}
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
                <PageHeader title={pageTitle} />

                <p className="alert-error" role="alert">
                    {loadError}
                </p>
            </PageContainer>
        );
    }

    if (!tasklist) {
        return (
            <PageContainer>
                {memberPicker}
                <PageHeader title={pageTitle} />

                {isOwnList ? (
                    <div className="empty-state">
                        <p>You have no tasklist for today yet.</p>

                        <button
                            type="button"
                            onClick={handleCreateTasklist}
                            disabled={isCreatingTasklist}
                            className="btn-primary mt-4"
                        >
                            {isCreatingTasklist
                                ? "Creating..."
                                : "Create Today's Tasklist"}
                        </button>

                        {createError && (
                            <p className="alert-error mt-4" role="alert">
                                {createError}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="empty-state">
                        {viewedMemberName} has not created a tasklist for today.
                    </p>
                )}
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

    const subtasksOf = (task: Task) =>
        tasklist.tasks.filter((subtask) => subtask.parentTaskId === task.id);

    const hasLinkedTasks = parentTasks.some((task) => task.sprintTask);
    const featureGroups =
        groupByFeature && hasLinkedTasks
            ? groupTasksByFeature(parentTasks)
            : null;

    const renderTask = (task: Task) => (
        <TaskCard
            key={task.id}
            tasklistId={tasklist.id}
            task={task}
            subtasks={subtasksOf(task)}
            sprintTaskOptions={sprintTaskOptions}
            locked={isLocked || !isOwnList}
            onCreated={handleTaskCreated}
            onUpdated={handleTaskUpdated}
            onDeleted={handleTaskDeleted}
            onError={(message) => showNotice("error", message)}
        />
    );

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
                title={pageTitle}
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
                <div className="flex flex-wrap items-center justify-between gap-4">
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

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-muted">
                            {tasklist.tasks.length} tasks
                        </span>

                        {/* Only the owner changes a tasklist; others see it read only. */}
                        {isOwnList && (
                            <>
                                {/* SOD - Start of Day button */}
                                <button
                                    type="button"
                                    disabled={isCapturingSod || !!tasklist.sodCapturedAt}
                                    onClick={handleStartDay}
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
                                    disabled={isLocked}
                                    onClick={() => setIsEndDayOpen(true)}
                                    className="btn-secondary"
                                >
                                    {isLocked ? "EOD Captured" : "End Day"}
                                </button>

                                {/* Copies yesterday's unfinished tasks into today's list */}
                                <button
                                    type="button"
                                    onClick={handleCarryOver}
                                    disabled={isCarryingOver || isLocked}
                                    className="btn-secondary"
                                >
                                    {isCarryingOver
                                        ? "Carrying over..."
                                        : "Carry Over Unfinished"}
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
                            </>
                        )}
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

                {isEndDayOpen && isOwnList && !isLocked && (
                    <EndDayModal
                        tasklistId={tasklist.id}
                        tasks={parentTasks}
                        subtasksOf={subtasksOf}
                        onClose={() => setIsEndDayOpen(false)}
                        onEnded={handleDayEnded}
                    />
                )}

                {isAddingTask && isOwnList && (
                    <AddTaskForm
                        tasklistId={tasklist.id}
                        nextOrder={parentTasks.length + 1}
                        sprintTaskOptions={sprintTaskOptions}
                        availableMins={availableMins}
                        onCreated={(task) => {
                            handleTaskCreated(task);
                            setIsAddingTask(false);
                        }}
                        onCancel={() => setIsAddingTask(false)}
                        onError={(message) => showNotice("error", message)}
                    />
                )}

                {hasLinkedTasks && (
                    <label className="mt-4 flex w-fit items-center gap-2 text-sm text-muted">
                        <input
                            type="checkbox"
                            checked={groupByFeature}
                            onChange={(event) =>
                                setGroupByFeature(event.target.checked)
                            }
                        />
                        Group by feature
                    </label>
                )}

                {tasklist.tasks.length === 0 ? (
                    <p className="empty-state mt-6">No tasks added yet.</p>
                ) : featureGroups ? (
                    <div className="mt-6 space-y-6">
                        {featureGroups.map((group) => (
                            <div key={group.key}>
                                <h3 className="text-sm font-semibold text-muted">
                                    {group.label} ·{" "}
                                    {formatMinutes(
                                        group.tasks.reduce(
                                            (total, task) =>
                                                total +
                                                getPlannedMins(task, subtasksOf(task)),
                                            0,
                                        ),
                                    )}
                                </h3>

                                <div className="mt-2 space-y-3">
                                    {group.tasks.map(renderTask)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {parentTasks.map(renderTask)}
                    </div>
                )}
            </section>
        </PageContainer>
    );
}
