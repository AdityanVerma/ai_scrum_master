"use client";

import { useEffect, useState } from "react";

type Task = {
    id: string;
    taskId: string;
    title: string;
    description: string;
    complexity: "LOW" | "MEDIUM" | "HIGH";
    estimatedHours: number;
    skills: {
        id: string;
        skill: string;
    }[];
    dependencies: {
        id: string;
        taskId: string;
        dependsOnTaskId: string;
    }[];
};

type Sprint = {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    totalEstimatedHours: number;
    tasks: Task[];
};

export default function SprintDetailPage() {
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSprint() {
            try {
                const response = await fetch(
                    `/api/sprints/${window.location.pathname.split("/").pop()}`,
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch sprint.",
                    );
                }

                setSprint(result.data);
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
        <main className="min-h-screen bg-[#F8F7F2] px-6 py-10 text-[#1F2924]">
            <div className="mx-auto max-w-5xl">
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

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">
                        Tasks
                    </h2>

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

                                    <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-sm">
                                        {task.complexity}
                                    </span>
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
                                                        dependency.dependsOnTaskId,
                                                )
                                                .join(", ")}
                                        </p>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}