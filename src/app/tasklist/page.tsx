"use client";

import { useEffect, useState } from "react";

type Task = {
    id: string;
    title: string;
    category: string;
    estimatedMins: number;
    order: number;
    status: string;
    parentTaskId: string | null;
};

type Tasklist = {
    id: string;
    date: string;
    status: string;
    member: {
        id: string;
        name: string;
        role: string;
    };
    tasks: Task[];
};

const MEMBER_ID = "cmu25c92n000028lxjd5zo173";

export default function TasklistPage() {
    const [tasklist, setTasklist] = useState<Tasklist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskCategory, setTaskCategory] = useState("Development");
    const [availableHours, setAvailableHours] = useState("8");
    const [taskEstimatedMins, setTaskEstimatedMins] = useState("60");
    const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(
        null,
    );
    const [subtaskTitle, setSubtaskTitle] = useState("");
    const [subtaskEstimatedMins, setSubtaskEstimatedMins] = useState("60");
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskCategory, setEditTaskCategory] = useState("Development");
    const [editTaskEstimatedMins, setEditTaskEstimatedMins] = useState("60");
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
    const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
    const [editSubtaskEstimatedMins, setEditSubtaskEstimatedMins] =
        useState("60");

    useEffect(() => {
        async function fetchTasklist() {
            try {
                const date = new Date().toISOString().split("T")[0];

                const response = await fetch(
                    `/api/tasklists?memberId=${MEMBER_ID}&date=${date}`,
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch tasklist.",
                    );
                }

                setTasklist(result.data);
            } catch (error) {
                console.error("Failed to fetch tasklist:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTasklist();
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#f8f8f4] p-8">
                <p className="text-sm text-gray-500">Loading tasklist...</p>
            </main>
        );
    }

    if (!tasklist) {
        return (
            <main className="min-h-screen bg-[#f8f8f4] p-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                    My Tasklist
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    No tasklist has been created for today.
                </p>
            </main>
        );
    }

    const parentTasks = tasklist.tasks.filter(
        (task) => !task.parentTaskId,
    );

    const totalPlannedMins = parentTasks.reduce((total, task) => {
        const subtasks = tasklist.tasks.filter(
            (subtask) => subtask.parentTaskId === task.id,
        );

        const taskMins =
            subtasks.length > 0
                ? subtasks.reduce(
                    (subtotal, subtask) =>
                        subtotal + subtask.estimatedMins,
                    0,
                )
                : task.estimatedMins;

        return total + taskMins;
    }, 0);

    const totalPlannedHours = Math.floor(totalPlannedMins / 60);
    const totalPlannedRemainingMins = totalPlannedMins % 60;

    const availableMins = Number(availableHours) * 60;
    const remainingMins = availableMins - totalPlannedMins;

    const isOverCapacity = remainingMins < 0;
    const capacityHours = Math.floor(Math.abs(remainingMins) / 60);
    const capacityMinutes = Math.abs(remainingMins) % 60;

    return (
        <main className="min-h-screen bg-[#f8f8f4] p-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            My Tasklist
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            {tasklist.member.name} · {tasklist.member.role}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                            {new Date(tasklist.date).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                },
                            )}
                        </p>

                        <p className="text-xs text-gray-500">
                            {tasklist.status}
                        </p>
                    </div>
                </div>

                <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Today&apos;s Tasks
                            </h2>

                            <div className="mt-1 flex items-center gap-4 text-sm">
                                <span className="text-gray-500">
                                    Planned:{" "}
                                    {totalPlannedHours > 0 &&
                                        `${totalPlannedHours}h `}
                                    {totalPlannedRemainingMins > 0 &&
                                        `${totalPlannedRemainingMins}m`}
                                    {totalPlannedMins === 0 && "0m"}
                                </span>

                                <label className="flex items-center gap-2 text-gray-500">
                                    Available:
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.5"
                                        value={availableHours}
                                        onChange={(event) =>
                                            setAvailableHours(event.target.value)
                                        }
                                        className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm text-gray-700 outline-none focus:border-emerald-500"
                                    />
                                    h
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                {tasklist.tasks.length} tasks
                            </span>

                            <button
                                type="button"
                                onClick={() => setIsAddingTask(true)}
                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                            >
                                + Add Task
                            </button>
                        </div>
                    </div>

                    <div
                        className={`mt-4 rounded-lg px-4 py-3 text-sm ${isOverCapacity
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        {isOverCapacity ? (
                            <>
                                Over capacity by{" "}
                                <strong>
                                    {capacityHours > 0 && `${capacityHours}h `}
                                    {capacityMinutes > 0 && `${capacityMinutes}m`}
                                </strong>
                            </>
                        ) : (
                            <>
                                Remaining capacity:{" "}
                                <strong>
                                    {capacityHours > 0 && `${capacityHours}h `}
                                    {capacityMinutes > 0 && `${capacityMinutes}m`}
                                </strong>
                            </>
                        )}
                    </div>

                    {isAddingTask && (
                        <form
                            onSubmit={async (event) => {
                                event.preventDefault();

                                try {
                                    const response = await fetch(
                                        `/api/tasklists/${tasklist.id}/tasks`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                title: taskTitle,
                                                category: taskCategory,
                                                estimatedMins:
                                                    Number(taskEstimatedMins),
                                                order:
                                                    tasklist.tasks.filter(
                                                        (task) =>
                                                            !task.parentTaskId,
                                                    ).length + 1,
                                            }),
                                        },
                                    );

                                    const result = await response.json();

                                    if (!response.ok) {
                                        throw new Error(
                                            result.error ||
                                            "Failed to create task.",
                                        );
                                    }

                                    setTasklist({
                                        ...tasklist,
                                        tasks: [
                                            ...tasklist.tasks,
                                            result.data,
                                        ],
                                    });

                                    setTaskTitle("");
                                    setTaskCategory("Development");
                                    setTaskEstimatedMins("60");
                                    setIsAddingTask(false);
                                } catch (error) {
                                    console.error(
                                        "Failed to create task:",
                                        error,
                                    );
                                    alert("Failed to create task.");
                                }
                            }}
                            className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                            <div className="grid gap-4 md:grid-cols-3">
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    value={taskTitle}
                                    onChange={(event) =>
                                        setTaskTitle(event.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                    required
                                />

                                <select
                                    value={taskCategory}
                                    onChange={(event) =>
                                        setTaskCategory(event.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="Development">
                                        Development
                                    </option>
                                    <option value="Testing">Testing</option>
                                    <option value="Documentation">
                                        Documentation
                                    </option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Non-sprint">
                                        Non-sprint
                                    </option>
                                </select>

                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Estimated minutes"
                                    value={taskEstimatedMins}
                                    onChange={(event) =>
                                        setTaskEstimatedMins(
                                            event.target.value,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                                >
                                    Add Task
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsAddingTask(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {tasklist.tasks.length === 0 ? (
                        <p className="mt-6 text-sm text-gray-500">
                            No tasks added yet.
                        </p>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {tasklist.tasks
                                .filter((task) => !task.parentTaskId)
                                .sort((a, b) => a.order - b.order)
                                .map((task) => {
                                    const subtasks = tasklist.tasks.filter(
                                        (subtask) =>
                                            subtask.parentTaskId === task.id,
                                    );

                                    const totalEstimatedMins =
                                        subtasks.length > 0
                                            ? subtasks.reduce(
                                                (total, subtask) =>
                                                    total +
                                                    subtask.estimatedMins,
                                                0,
                                            )
                                            : task.estimatedMins;

                                    return (
                                        <div
                                            key={task.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-green-700">
                                                        {task.category}
                                                    </p>

                                                    <h3 className="mt-1 font-medium text-gray-900">
                                                        {task.order}. {task.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">
                                                        {totalEstimatedMins / 60}h
                                                    </span>

                                                    <select
                                                        value={task.status}
                                                        onChange={async (event) => {
                                                            try {
                                                                const response = await fetch(
                                                                    `/api/tasklists/${tasklist.id}/tasks`,
                                                                    {
                                                                        method: "PUT",
                                                                        headers: {
                                                                            "Content-Type": "application/json",
                                                                        },
                                                                        body: JSON.stringify({
                                                                            taskId: task.id,
                                                                            status: event.target.value,
                                                                        }),
                                                                    },
                                                                );

                                                                const result = await response.json();

                                                                if (!response.ok) {
                                                                    throw new Error(
                                                                        result.error || "Failed to update status.",
                                                                    );
                                                                }

                                                                setTasklist({
                                                                    ...tasklist,
                                                                    tasks: tasklist.tasks.map((item) =>
                                                                        item.id === task.id ? result.data : item,
                                                                    ),
                                                                });
                                                            } catch (error) {
                                                                console.error(
                                                                    "Failed to update task status:",
                                                                    error,
                                                                );

                                                                alert("Failed to update task status.");
                                                            }
                                                        }}
                                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="DONE">Done</option>
                                                        <option value="BLOCKED">Blocked</option>
                                                    </select>

                                                    {/* Task 'Edit' button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingTaskId(task.id);
                                                            setEditTaskTitle(task.title);
                                                            setEditTaskCategory(task.category);
                                                            setEditTaskEstimatedMins(
                                                                String(task.estimatedMins),
                                                            );
                                                        }}
                                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Task 'Delete' button */}
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!confirm(`Delete "${task.title}"?`)) {
                                                                return;
                                                            }

                                                            try {
                                                                const response = await fetch(
                                                                    `/api/tasklists/${tasklist.id}/tasks?taskId=${task.id}`,
                                                                    {
                                                                        method: "DELETE",
                                                                    },
                                                                );

                                                                const result = await response.json();

                                                                if (!response.ok) {
                                                                    throw new Error(
                                                                        result.error || "Failed to delete task.",
                                                                    );
                                                                }

                                                                setTasklist({
                                                                    ...tasklist,
                                                                    tasks: tasklist.tasks.filter(
                                                                        (item) =>
                                                                            item.id !== task.id &&
                                                                            item.parentTaskId !== task.id,
                                                                    ),
                                                                });
                                                            } catch (error) {
                                                                console.error("Failed to delete task:", error);
                                                                alert("Failed to delete task.");
                                                            }
                                                        }}
                                                        className="text-sm font-medium text-red-500 hover:text-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                            </div>

                                            {/* Editing Task */}
                                            {editingTaskId === task.id && (
                                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                    <div className="grid gap-4 md:grid-cols-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Task title"
                                                            value={editTaskTitle}
                                                            onChange={(event) =>
                                                                setEditTaskTitle(event.target.value)
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                        />

                                                        <select
                                                            value={editTaskCategory}
                                                            onChange={(event) =>
                                                                setEditTaskCategory(event.target.value)
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                        >
                                                            <option value="Development">Development</option>
                                                            <option value="Testing">Testing</option>
                                                            <option value="Documentation">
                                                                Documentation
                                                            </option>
                                                            <option value="Meeting">Meeting</option>
                                                            <option value="Non-sprint">Non-sprint</option>
                                                        </select>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Estimated minutes"
                                                            value={editTaskEstimatedMins}
                                                            onChange={(event) =>
                                                                setEditTaskEstimatedMins(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await fetch(
                                                                        `/api/tasklists/${tasklist.id}/tasks`,
                                                                        {
                                                                            method: "PUT",
                                                                            headers: {
                                                                                "Content-Type": "application/json",
                                                                            },
                                                                            body: JSON.stringify({
                                                                                taskId: task.id,
                                                                                title: editTaskTitle,
                                                                                category: editTaskCategory,
                                                                                estimatedMins: Number(editTaskEstimatedMins),
                                                                            }),
                                                                        },
                                                                    );

                                                                    const result = await response.json();

                                                                    if (!response.ok) {
                                                                        throw new Error(
                                                                            result.error || "Failed to update task.",
                                                                        );
                                                                    }

                                                                    setTasklist({
                                                                        ...tasklist,
                                                                        tasks: tasklist.tasks.map((item) =>
                                                                            item.id === task.id ? result.data : item,
                                                                        ),
                                                                    });

                                                                    setEditingTaskId(null);
                                                                } catch (error) {
                                                                    console.error("Failed to update task:", error);
                                                                    alert("Failed to update task.");
                                                                }
                                                            }}
                                                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingTaskId(null)}
                                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Subtask */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingSubtaskFor(
                                                        task.id,
                                                    );
                                                    setSubtaskTitle("");
                                                    setSubtaskEstimatedMins(
                                                        "60",
                                                    );
                                                }}
                                                className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                            >
                                                + Add Subtask
                                            </button>

                                            {addingSubtaskFor === task.id && (
                                                <form
                                                    onSubmit={async (event) => {
                                                        event.preventDefault();

                                                        try {
                                                            const existingSubtasks =
                                                                tasklist.tasks.filter(
                                                                    (subtask) =>
                                                                        subtask.parentTaskId ===
                                                                        task.id,
                                                                );

                                                            const response =
                                                                await fetch(
                                                                    `/api/tasklists/${tasklist.id}/tasks`,
                                                                    {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Content-Type":
                                                                                "application/json",
                                                                        },
                                                                        body: JSON.stringify(
                                                                            {
                                                                                title: subtaskTitle,
                                                                                category:
                                                                                    task.category,
                                                                                estimatedMins:
                                                                                    Number(
                                                                                        subtaskEstimatedMins,
                                                                                    ),
                                                                                order:
                                                                                    existingSubtasks.length +
                                                                                    1,
                                                                                parentTaskId:
                                                                                    task.id,
                                                                            },
                                                                        ),
                                                                    },
                                                                );

                                                            const result =
                                                                await response.json();

                                                            if (!response.ok) {
                                                                throw new Error(
                                                                    result.error ||
                                                                    "Failed to create subtask.",
                                                                );
                                                            }

                                                            setTasklist({
                                                                ...tasklist,
                                                                tasks: [
                                                                    ...tasklist.tasks,
                                                                    result.data,
                                                                ],
                                                            });

                                                            setSubtaskTitle("");
                                                            setSubtaskEstimatedMins(
                                                                "60",
                                                            );
                                                            setAddingSubtaskFor(
                                                                null,
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                "Failed to create subtask:",
                                                                error,
                                                            );
                                                            alert(
                                                                "Failed to create subtask.",
                                                            );
                                                        }
                                                    }}
                                                    className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                                                >
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Subtask title"
                                                            value={
                                                                subtaskTitle
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                setSubtaskTitle(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                            required
                                                        />

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Minutes"
                                                            value={
                                                                subtaskEstimatedMins
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                setSubtaskEstimatedMins(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            type="submit"
                                                            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                                                        >
                                                            Add Subtask
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setAddingSubtaskFor(
                                                                    null,
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {subtasks.length > 0 && (
                                                <div className="mt-3 space-y-2 pl-4">
                                                    {subtasks
                                                        .sort((a, b) => a.order - b.order)
                                                        .map((subtask) => (
                                                            <div
                                                                key={subtask.id}
                                                                className="flex items-center justify-between text-sm text-gray-700"
                                                            >
                                                                <div>
                                                                    <span>
                                                                        {task.order}.{subtask.order}{" "}
                                                                        {subtask.title}
                                                                    </span>

                                                                    <span className="ml-2 text-gray-500">
                                                                        — {subtask.estimatedMins / 60}h
                                                                    </span>
                                                                </div>

                                                                <select
                                                                    value={subtask.status}
                                                                    onChange={async (event) => {
                                                                        try {
                                                                            const response = await fetch(
                                                                                `/api/tasklists/${tasklist.id}/tasks`,
                                                                                {
                                                                                    method: "PUT",
                                                                                    headers: {
                                                                                        "Content-Type": "application/json",
                                                                                    },
                                                                                    body: JSON.stringify({
                                                                                        taskId: subtask.id,
                                                                                        status: event.target.value,
                                                                                    }),
                                                                                },
                                                                            );

                                                                            const result = await response.json();

                                                                            if (!response.ok) {
                                                                                throw new Error(
                                                                                    result.error || "Failed to update status.",
                                                                                );
                                                                            }

                                                                            setTasklist({
                                                                                ...tasklist,
                                                                                tasks: tasklist.tasks.map((item) =>
                                                                                    item.id === subtask.id ? result.data : item,
                                                                                ),
                                                                            });
                                                                        } catch (error) {
                                                                            console.error(
                                                                                "Failed to update subtask status:",
                                                                                error,
                                                                            );

                                                                            alert("Failed to update subtask status.");
                                                                        }
                                                                    }}
                                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-emerald-500"
                                                                >
                                                                    <option value="PENDING">Pending</option>
                                                                    <option value="IN_PROGRESS">In Progress</option>
                                                                    <option value="DONE">Done</option>
                                                                    <option value="BLOCKED">Blocked</option>
                                                                </select>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingSubtaskId(subtask.id);
                                                                        setEditSubtaskTitle(subtask.title);
                                                                        setEditSubtaskEstimatedMins(
                                                                            String(subtask.estimatedMins),
                                                                        );
                                                                    }}
                                                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                                                >
                                                                    Edit
                                                                </button>

                                                                {editingSubtaskId === subtask.id && (
                                                                    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                                        <div className="flex gap-3">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Subtask title"
                                                                                value={editSubtaskTitle}
                                                                                onChange={(event) =>
                                                                                    setEditSubtaskTitle(event.target.value)
                                                                                }
                                                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                                            />

                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                placeholder="Minutes"
                                                                                value={editSubtaskEstimatedMins}
                                                                                onChange={(event) =>
                                                                                    setEditSubtaskEstimatedMins(
                                                                                        event.target.value,
                                                                                    )
                                                                                }
                                                                                className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                                                            />
                                                                        </div>

                                                                        <div className="mt-3 flex gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        const response = await fetch(
                                                                                            `/api/tasklists/${tasklist.id}/tasks`,
                                                                                            {
                                                                                                method: "PUT",
                                                                                                headers: {
                                                                                                    "Content-Type":
                                                                                                        "application/json",
                                                                                                },
                                                                                                body: JSON.stringify({
                                                                                                    taskId: subtask.id,
                                                                                                    title: editSubtaskTitle,
                                                                                                    estimatedMins: Number(
                                                                                                        editSubtaskEstimatedMins,
                                                                                                    ),
                                                                                                }),
                                                                                            },
                                                                                        );

                                                                                        const result = await response.json();

                                                                                        if (!response.ok) {
                                                                                            throw new Error(
                                                                                                result.error ||
                                                                                                "Failed to update subtask.",
                                                                                            );
                                                                                        }

                                                                                        setTasklist({
                                                                                            ...tasklist,
                                                                                            tasks: tasklist.tasks.map((item) =>
                                                                                                item.id === subtask.id
                                                                                                    ? result.data
                                                                                                    : item,
                                                                                            ),
                                                                                        });

                                                                                        setEditingSubtaskId(null);
                                                                                    } catch (error) {
                                                                                        console.error(
                                                                                            "Failed to update subtask:",
                                                                                            error,
                                                                                        );

                                                                                        alert("Failed to update subtask.");
                                                                                    }
                                                                                }}
                                                                                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                                                                            >
                                                                                Save
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingSubtaskId(null)}
                                                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        if (
                                                                            !confirm(
                                                                                `Delete "${subtask.title}"?`,
                                                                            )
                                                                        ) {
                                                                            return;
                                                                        }

                                                                        try {
                                                                            const response = await fetch(
                                                                                `/api/tasklists/${tasklist.id}/tasks?taskId=${subtask.id}`,
                                                                                {
                                                                                    method: "DELETE",
                                                                                },
                                                                            );

                                                                            const result = await response.json();

                                                                            if (!response.ok) {
                                                                                throw new Error(
                                                                                    result.error ||
                                                                                    "Failed to delete subtask.",
                                                                                );
                                                                            }

                                                                            setTasklist({
                                                                                ...tasklist,
                                                                                tasks: tasklist.tasks.filter(
                                                                                    (item) =>
                                                                                        item.id !== subtask.id,
                                                                                ),
                                                                            });
                                                                        } catch (error) {
                                                                            console.error(
                                                                                "Failed to delete subtask:",
                                                                                error,
                                                                            );

                                                                            alert("Failed to delete subtask.");
                                                                        }
                                                                    }}
                                                                    className="ml-4 text-xs font-medium text-red-500 hover:text-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}