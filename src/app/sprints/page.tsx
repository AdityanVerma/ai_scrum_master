"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import OvertimeBadge from "@/components/sprints/OvertimeBadge";
import {
    countUnfinishedTasks,
    sprintStatusStyles,
    type SprintStatus,
} from "@/components/sprints/shared";
import { formatDate } from "@/lib/format-date";

type Sprint = {
    id: string;
    name: string;
    status: SprintStatus;
    goal: string;
    startDate: string;
    endDate: string;
    totalEstimatedHours: number;
    tasks: { status: string }[];
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
        <PageContainer>
            <PageHeader
                title="Saved Sprints"
                description="Previously generated sprint proposals."
            />

            {isLoading && (
                <p className="text-sm text-muted">Loading sprints...</p>
            )}

            {error && <p className="alert-error">{error}</p>}

            {!isLoading && !error && sprints.length === 0 && (
                <p className="empty-state">No saved sprints yet.</p>
            )}

            <div className="space-y-4">
                {sprints.map((sprint) => (
                    <div key={sprint.id} className="card">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold">
                                {sprint.name}
                            </h2>

                            <span
                                className={`badge ${sprintStatusStyles[sprint.status]}`}
                            >
                                {sprint.status}
                            </span>

                            <OvertimeBadge
                                sprint={sprint}
                                unfinishedTasks={countUnfinishedTasks(sprint.tasks)}
                            />
                        </div>

                        <p className="mt-2 text-muted">{sprint.goal}</p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                            <span>
                                {formatDate(sprint.startDate)} →{" "}
                                {formatDate(sprint.endDate)}
                            </span>

                            <span>{sprint.totalEstimatedHours} hours</span>
                        </div>

                        <Link
                            href={`/sprints/${sprint.id}`}
                            className="btn-primary mt-5"
                        >
                            View Sprint
                        </Link>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
