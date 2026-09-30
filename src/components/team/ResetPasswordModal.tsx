"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";
import CredentialsNotice from "@/components/team/CredentialsNotice";
import TemporaryPasswordField from "@/components/team/TemporaryPasswordField";
import type { TeamMember } from "@/components/team/shared";

type ResetPasswordModalProps = {
    member: TeamMember;
    onClose: () => void;
};

export default function ResetPasswordModal({
    member,
    onClose,
}: ResetPasswordModalProps) {
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isDone, setIsDone] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setIsSaving(true);

        try {
            const response = await fetch(
                `/api/team-members/${member.id}/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ temporaryPassword }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to reset password.");
            }

            setIsDone(true);
        } catch (error) {
            console.error("Failed to reset password:", error);

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to reset password.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal title="Reset Password" onClose={onClose} className="max-w-md">
            {isDone && member.email ? (
                <CredentialsNotice
                    name={member.name}
                    email={member.email}
                    temporaryPassword={temporaryPassword}
                    onDone={onClose}
                />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <p className="text-sm text-muted">
                        Set a temporary password for {member.name}. Their
                        current password stops working immediately.
                    </p>

                    <TemporaryPasswordField
                        id="reset-temporary-password"
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
                            {isSaving ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
