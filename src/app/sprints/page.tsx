"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sprint = {
    id: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    totalEstimatedHours: number;
};

export default function SprintsPage() {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSprints() {
            try {
                const response = await fetch("/api/sprints");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch sprints.",
                    );
                }

                setSprints(result.data);
            } catch (error) {
                console.error("Failed to fetch sprints:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch sprints.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchSprints();
    }, []);

    return (
        <main className="min-h-screen bg-[#F8F7F2] px-6 py-10 text-[#1F2924]">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-semibold">
                    Saved Sprints
                </h1>

                <p className="mt-2 text-[#5F6B64]">
                    Previously generated sprint proposals.
                </p>

                {isLoading && (
                    <p className="mt-8">Loading sprints...</p>
                )}

                {error && (
                    <p className="mt-8 text-red-600">
                        {error}
                    </p>
                )}

                {!isLoading && !error && sprints.length === 0 && (
                    <p className="mt-8">
                        No saved sprints yet.
                    </p>
                )}

                <div className="mt-8 space-y-4">
                    {sprints.map((sprint) => (
                        <div
                            key={sprint.id}
                            className="rounded-2xl border border-[#DDE8E1] bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-xl font-semibold">
                                {sprint.name}
                            </h2>

                            <p className="mt-2 text-[#5F6B64]">
                                {sprint.goal}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
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

                            <Link
                                href={`/sprints/${sprint.id}`}
                                className="mt-5 inline-block rounded-lg bg-[#78C9A3] px-4 py-2 text-sm font-medium text-[#1F2924] transition hover:bg-[#91D8B9]"
                            >
                                View Sprint
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}