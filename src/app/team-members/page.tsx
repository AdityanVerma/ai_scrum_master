"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import AddMemberModal from "@/components/team/AddMemberModal";
import ResetPasswordModal from "@/components/team/ResetPasswordModal";
import TimeOffSection from "@/components/team/TimeOffSection";
import type { TeamMember } from "@/components/team/shared";

type CurrentMember = {
    id: string;
    accessRole: TeamMember["accessRole"];
};

export default function TeamMembersPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentMember, setCurrentMember] = useState<CurrentMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [resetPasswordFor, setResetPasswordFor] = useState<TeamMember | null>(null);

    useEffect(() => {
        async function fetchTeamMembers() {
            try {
                const [membersResponse, meResponse] = await Promise.all([
                    fetch("/api/team-members"),
                    fetch("/api/auth/me"),
                ]);

                const membersResult = await membersResponse.json();

                if (!membersResponse.ok) {
                    throw new Error(
                        membersResult.error || "Failed to fetch team members.",
                    );
                }

                setTeamMembers(membersResult.data);

                if (meResponse.ok) {
                    const meResult = await meResponse.json();
                    setCurrentMember(meResult.data.member);
                }
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

    // Buttons are a convenience; the API checks the role on every request.
    const isScrumMaster = currentMember?.accessRole === "SCRUM_MASTER";

    async function handleSetActive(member: TeamMember, isActive: boolean) {
        if (
            !isActive &&
            !confirm(
                `Deactivate ${member.name}? They are signed out and cannot sign in. Their tasks, tasklists and documents are kept.`,
            )
        ) {
            return;
        }

        setActionError(null);
        setBusyMemberId(member.id);

        try {
            const response = await fetch(`/api/team-members/${member.id}/access`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update member.");
            }

            setTeamMembers((members) =>
                members.map((item) => (item.id === member.id ? result.data : item)),
            );
        } catch (error) {
            console.error("Failed to change member access:", error);

            setActionError(
                error instanceof Error ? error.message : "Failed to update member.",
            );
        } finally {
            setBusyMemberId(null);
        }
    }

    async function handleDelete(member: TeamMember) {
        if (
            !confirm(
                `Delete ${member.name} permanently? This only works for members with no sprint tasks, tasklists or documents.`,
            )
        ) {
            return;
        }

        setActionError(null);
        setBusyMemberId(member.id);

        try {
            const response = await fetch(`/api/team-members/${member.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete member.");
            }

            setTeamMembers((members) =>
                members.filter((item) => item.id !== member.id),
            );
        } catch (error) {
            console.error("Failed to delete member:", error);

            setActionError(
                error instanceof Error ? error.message : "Failed to delete member.",
            );
        } finally {
            setBusyMemberId(null);
        }
    }

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

    // Active members first; sort keeps the API's newest-first order within each group.
    const sortedMembers = [...teamMembers].sort(
        (a, b) => Number(b.isActive) - Number(a.isActive),
    );

    return (
        <PageContainer>
            <PageHeader
                title="Team Members"
                description="Manage your Scrum team and their skills."
                action={
                    isScrumMaster && (
                        <button
                            type="button"
                            onClick={() => setIsAddMemberOpen(true)}
                            className="btn-primary"
                        >
                            Add Member
                        </button>
                    )
                }
            />

            {actionError && (
                <p className="alert-error mb-6" role="alert">
                    {actionError}
                </p>
            )}

            {teamMembers.length === 0 && (
                <p className="empty-state">No team members yet.</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedMembers.map((member) => {
                    const isSelf = member.id === currentMember?.id;
                    const isBusy = busyMemberId === member.id;
                    // Everyone gets Edit Profile on their own card; the Scrum
                    // Master also gets Edit and access controls on everyone else's.
                    const showControls = isScrumMaster || isSelf;

                    return (
                        <article
                            key={member.id}
                            className={`card flex flex-col ${member.isActive ? "" : "opacity-70"}`}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    <Link
                                        href={`/team-members/${member.id}`}
                                        className="hover:underline"
                                    >
                                        {member.name}
                                    </Link>
                                </h2>

                                {isSelf && <span className="badge badge-muted">You</span>}

                                {member.accessRole === "SCRUM_MASTER" && (
                                    <span className="badge badge-brand">Scrum Master</span>
                                )}

                                {!member.isActive && (
                                    <span className="badge badge-danger">Deactivated</span>
                                )}

                                {isScrumMaster && !member.email && (
                                    <span className="badge badge-warning">No login</span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-muted">
                                {member.role}
                            </p>

                            {member.email && (
                                <p className="mt-1 text-sm break-all text-muted">
                                    {member.email}
                                </p>
                            )}

                            <div className={`mt-4 ${showControls ? "pb-5" : ""}`}>
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

                            {showControls && (
                                // mt-auto keeps the buttons at the bottom of cards in the same row.
                                <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
                                    <Link
                                        href={`/team-members/${member.id}`}
                                        className="btn-secondary"
                                    >
                                        {isSelf ? "Edit Profile" : "Edit"}
                                    </Link>

                                    {!isSelf && (
                                        <>
                                            {member.isActive && member.email && (
                                                <button
                                                    type="button"
                                                    onClick={() => setResetPasswordFor(member)}
                                                    disabled={isBusy}
                                                    className="btn-secondary"
                                                >
                                                    Reset Password
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleSetActive(member, !member.isActive)}
                                                disabled={isBusy}
                                                className="btn-secondary"
                                            >
                                                {member.isActive ? "Deactivate" : "Reactivate"}
                                            </button>

                                            {!member.isActive && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(member)}
                                                    disabled={isBusy}
                                                    className="btn-secondary text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Public holidays and leave, for the Daily Sprint Diary */}
            {isScrumMaster && <TimeOffSection members={teamMembers} />}

            {isAddMemberOpen && (
                <AddMemberModal
                    onClose={() => setIsAddMemberOpen(false)}
                    onCreated={(member) =>
                        setTeamMembers((members) => [member, ...members])
                    }
                />
            )}

            {resetPasswordFor && (
                <ResetPasswordModal
                    member={resetPasswordFor}
                    onClose={() => setResetPasswordFor(null)}
                />
            )}
        </PageContainer>
    );
}
