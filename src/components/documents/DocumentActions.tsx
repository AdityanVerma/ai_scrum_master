"use client";

import { useState } from "react";
import DocumentFormModal, {
    type Document,
} from "@/components/documents/DocumentFormModal";

// Members may change only documents they added; the Scrum Master may change
// any. The API checks the same rule, so this only decides what is shown.
export function canChangeDocument(
    document: Document,
    member: { id: string; accessRole: "SCRUM_MASTER" | "MEMBER" } | null,
) {
    if (!member) {
        return false;
    }

    return (
        member.accessRole === "SCRUM_MASTER" ||
        document.createdBy?.id === member.id
    );
}

type DocumentActionsProps = {
    document: Document;
    // Passed through to the edit form (see DocumentFormModal).
    sprintId?: string;
    sprints?: { id: string; name: string }[];
    onUpdated: (document: Document) => void;
    onDeleted: (documentId: string) => void;
};

// Edit and Delete buttons for one document card.
export default function DocumentActions({
    document,
    sprintId,
    sprints,
    onUpdated,
    onDeleted,
}: DocumentActionsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        if (!confirm(`Delete "${document.title}"? This cannot be undone.`)) {
            return;
        }

        setError(null);
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/documents/${document.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete document.");
            }

            onDeleted(document.id);
        } catch (error) {
            console.error("Failed to delete document:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete document.",
            );
            setIsDeleting(false);
        }
    }

    return (
        <div className="mt-4 border-t border-line pt-4">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn-secondary text-red-700"
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>

            {error && (
                <p className="alert-error mt-3" role="alert">
                    {error}
                </p>
            )}

            {isEditing && (
                <DocumentFormModal
                    document={document}
                    sprintId={sprintId}
                    sprints={sprints}
                    onClose={() => setIsEditing(false)}
                    onSaved={onUpdated}
                />
            )}
        </div>
    );
}
