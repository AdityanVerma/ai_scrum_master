"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";
import CredentialsNotice from "@/components/team/CredentialsNotice";
import TemporaryPasswordField from "@/components/team/TemporaryPasswordField";
import type { TeamMember } from "@/components/team/shared";

type AddMemberModalProps = {
    onClose: () => void;
    onCreated: (member: TeamMember) => void;
};

// Rendered only while open, so the form starts empty every time.
export default function AddMemberModal({
    onClose,
    onCreated,
}: AddMemberModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [skills, setSkills] = useState("");
    const [accessRole, setAccessRole] = useState<TeamMember["accessRole"]>("MEMBER");
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [created, setCreated] = useState<TeamMember | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setIsSaving(true);

        try {
            const response = await fetch("/api/team-members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    role,
                    skills: skills.split(","),
                    accessRole,
                    temporaryPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to add team member.");
            }

            onCreated(result.data);
            setCreated(result.data);
        } catch (error) {
            console.error("Failed to add team member:", error);

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to add team member.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (created) {
        return (
            <Modal title="Member Added" onClose={onClose} className="max-w-md">
                <CredentialsNotice
                    name={created.name}
                    email={created.email ?? email}
                    temporaryPassword={temporaryPassword}
                    onDone={onClose}
                />
            </Modal>
        );
    }

    return (
        <Modal title="Add Member" onClose={onClose}>
            <p className="mb-6 text-sm text-muted">
                Add a team member and set a temporary password for their first
                sign-in.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="member-name" className="label">Name</label>

                        <input
                            id="member-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="member-email" className="label">Email</label>

                        <input
                            id="member-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="input"
                            autoComplete="off"
                            required
                        />

                        <p className="hint">They sign in with this email.</p>
                    </div>

                    <div>
                        <label htmlFor="member-role" className="label">Job Title</label>

                        <input
                            id="member-role"
                            type="text"
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            placeholder="e.g. Frontend Developer"
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="member-access-role" className="label">Access</label>

                        <select
                            id="member-access-role"
                            value={accessRole}
                            onChange={(event) =>
                                setAccessRole(
                                    event.target.value as TeamMember["accessRole"],
                                )
                            }
                            className="input"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="SCRUM_MASTER">Scrum Master</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="member-skills" className="label">Skills</label>

                    <input
                        id="member-skills"
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

                <TemporaryPasswordField
                    id="member-temporary-password"
                    value={temporaryPassword}
                    onChange={setTemporaryPassword}
                />

                {formError && (
                    <p className="alert-error" role="alert">
                        {formError}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>

                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? "Adding..." : "Add Member"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
