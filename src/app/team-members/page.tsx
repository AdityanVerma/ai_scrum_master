"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";

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
                <p>Loading team members...</p>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <p className="text-red-600">{error}</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Team Members
                    </h1>

                    <p className="mt-2 text-[#5F6B64]">
                        Manage your Scrum team and their skills.
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl bg-[#8CC9A8] px-4 py-2 text-sm font-medium text-[#1F2924] transition hover:opacity-90"
                >
                    Add Team Member
                </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                    <article
                        key={member.id}
                        className="rounded-2xl border border-[#DDE8E1] bg-white p-5 shadow-sm"
                    >
                        <h2 className="text-lg font-semibold">
                            {member.name}
                        </h2>

                        <p className="mt-1 text-sm text-[#5F6B64]">
                            {member.role}
                        </p>

                        <div className="mt-4">
                            <p className="text-sm font-medium">
                                Skills
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {member.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="rounded-full bg-[#E8F6EF] px-3 py-1 text-xs"
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