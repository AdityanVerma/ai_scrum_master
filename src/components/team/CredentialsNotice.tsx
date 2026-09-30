"use client";

import { useState } from "react";

type CredentialsNoticeProps = {
    name: string;
    email: string;
    temporaryPassword: string;
    onDone: () => void;
};

// Shown once after adding a member or resetting a password, so the Scrum
// Master can pass the sign-in details on. The password is not shown again.
export default function CredentialsNotice({
    name,
    email,
    temporaryPassword,
    onDone,
}: CredentialsNoticeProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(
                `Email: ${email}\nTemporary password: ${temporaryPassword}`,
            );
            setCopied(true);
        } catch (error) {
            console.error("Failed to copy sign-in details:", error);
        }
    }

    return (
        <div className="space-y-5">
            <p className="text-sm text-muted">
                Give {name} these sign-in details. They will be asked to choose
                a new password when they sign in. This password is not shown
                again.
            </p>

            <dl className="space-y-3 rounded-lg border border-line p-4 text-sm">
                <div>
                    <dt className="text-muted">Email</dt>
                    <dd className="font-medium">{email}</dd>
                </div>

                <div>
                    <dt className="text-muted">Temporary password</dt>
                    <dd className="font-mono font-medium">{temporaryPassword}</dd>
                </div>
            </dl>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={handleCopy} className="btn-secondary">
                    {copied ? "Copied" : "Copy details"}
                </button>

                <button type="button" onClick={onDone} className="btn-primary">
                    Done
                </button>
            </div>
        </div>
    );
}
