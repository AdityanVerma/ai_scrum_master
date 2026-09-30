"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { PROFILE_UPDATED_EVENT, type TeamMember } from "@/components/team/shared";

type CurrentMember = {
    id: string;
    accessRole: TeamMember["accessRole"];
};

export default function TeamMemberProfilePage() {
    const { id: memberId } = useParams<{ id: string }>();
    const [member, setMember] = useState<TeamMember | null>(null);
    const [currentMember, setCurrentMember] = useState<CurrentMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [skills, setSkills] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    function fillForm(data: TeamMember) {
        setName(data.name);
        setRole(data.role);
        setEmail(data.email ?? "");
        setSkills(data.skills.map((skill) => skill.skill).join(", "));
    }

    useEffect(() => {
        async function fetchProfile() {
            try {
                const [memberResponse, meResponse] = await Promise.all([
                    fetch(`/api/team-members/${memberId}`),
                    fetch("/api/auth/me"),
                ]);

                const memberResult = await memberResponse.json();

                if (!memberResponse.ok) {
                    throw new Error(
                        memberResult.error || "Failed to fetch team member.",
                    );
                }

                setMember(memberResult.data);
                fillForm(memberResult.data);

                if (meResponse.ok) {
                    const meResult = await meResponse.json();
                    setCurrentMember(meResult.data.member);
                }
            } catch (error) {
                console.error("Failed to fetch team member:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch team member.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, [memberId]);

    const isSelf = currentMember?.id === memberId;
    const isScrumMaster = currentMember?.accessRole === "SCRUM_MASTER";
    // Buttons are a convenience; the API checks the same rules.
    const canEdit = isSelf || isScrumMaster;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setIsSaved(false);
        setIsSaving(true);

        try {
            const response = await fetch(`/api/team-members/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    skills: skills.split(","),
                    // Job title and email are Scrum Master only. An empty
                    // email is left unchanged.
                    ...(isScrumMaster && { role }),
                    ...(isScrumMaster && email.trim() && { email }),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to save profile.");
            }

            setMember(result.data);
            fillForm(result.data);
            setIsSaved(true);

            if (isSelf) {
                window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
            }
        } catch (error) {
            console.error("Failed to save profile:", error);

            setFormError(
                error instanceof Error ? error.message : "Failed to save profile.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <p className="text-sm text-muted">Loading profile...</p>
            </PageContainer>
        );
    }

    if (error || !member) {
        return (
            <PageContainer>
                <p className="alert-error">{error ?? "Team member not found."}</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                eyebrow={isSelf ? "Your profile" : "Team member"}
                title={member.name}
                description={member.role}
                action={
                    <Link href="/team-members" className="btn-secondary">
                        Back to Team
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="card lg:col-span-2">
                    <h2 className="mb-5 text-lg font-semibold">Details</h2>

                    {canEdit ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="profile-name" className="label">Name</label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="profile-role" className="label">Job Title</label>

                                <input
                                    id="profile-role"
                                    type="text"
                                    value={role}
                                    onChange={(event) => setRole(event.target.value)}
                                    className="input"
                                    disabled={!isScrumMaster}
                                    required
                                />

                                {!isScrumMaster && (
                                    <p className="hint">Only the Scrum Master can change this.</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="profile-email" className="label">Email</label>

                                <input
                                    id="profile-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="input"
                                    disabled={!isScrumMaster}
                                    autoComplete="off"
                                />

                                <p className="hint">
                                    {isScrumMaster
                                        ? member.email
                                            ? "Used to sign in. Changing it changes their sign-in email."
                                            : "No sign-in yet. Add an email, then use Reset Password on the Team page to set a temporary password."
                                        : "Used to sign in. Only the Scrum Master can change this."}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="profile-skills" className="label">Skills</label>

                                <input
                                    id="profile-skills"
                                    type="text"
                                    value={skills}
                                    onChange={(event) => setSkills(event.target.value)}
                                    placeholder="React, Node.js, PostgreSQL"
                                    className="input"
                                />

                                <p className="hint">
                                    Separate skills with commas. Skills drive task
                                    assignment recommendations.
                                </p>
                            </div>

                            {formError && (
                                <p className="alert-error" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                {isSaved && (
                                    <p className="text-sm text-brand-strong" role="status">
                                        Profile saved.
                                    </p>
                                )}

                                <button type="submit" disabled={isSaving} className="btn-primary">
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-muted">Email</dt>
                                <dd className="font-medium break-all">{member.email ?? "-"}</dd>
                            </div>

                            <div>
                                <dt className="text-muted">Skills</dt>
                                <dd className="mt-2 flex flex-wrap gap-2">
                                    {member.skills.length === 0 && <span className="text-muted">None listed</span>}

                                    {member.skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-strong"
                                        >
                                            {skill.skill}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        </dl>
                    )}
                </section>

                <aside className="card space-y-4 self-start text-sm">
                    <div>
                        <p className="text-muted">Access</p>
                        <p className="mt-1 flex flex-wrap gap-2">
                            <span className={`badge ${member.accessRole === "SCRUM_MASTER" ? "badge-brand" : "badge-muted"}`}>
                                {member.accessRole === "SCRUM_MASTER" ? "Scrum Master" : "Member"}
                            </span>

                            {!member.isActive && (
                                <span className="badge badge-danger">Deactivated</span>
                            )}
                        </p>
                    </div>

                    {isSelf && (
                        <div>
                            <p className="text-muted">Password</p>
                            <Link
                                href="/change-password"
                                className="mt-1 inline-block font-medium text-brand-strong hover:underline"
                            >
                                Change password
                            </Link>
                        </div>
                    )}
                </aside>
            </div>
        </PageContainer>
    );
}
