"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

type TeamMember = {
    id: string;
    name: string;
    role: string;
    skills: {
        id: string;
        skill: string;
    }[];
};

export default function TeamMembersPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch team members.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchTeamMembers();
    }, []);

    if (isLoading) {
        return (
            <PageContainer>
                <p className="text-sm text-muted">
                    Loading team members...
                </p>
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

    return (
        <PageContainer>
            <PageHeader
                title="Team Members"
                description="Manage your Scrum team and their skills."
            />

            {teamMembers.length === 0 && (
                <p className="empty-state">No team members yet.</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                    <article key={member.id} className="card">
                        <h2 className="text-lg font-semibold">
                            {member.name}
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            {member.role}
                        </p>

                        <div className="mt-4">
                            <p className="text-sm font-medium">Skills</p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {member.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-strong"
                                    >
                                        {skill.skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </PageContainer>
    );
}
