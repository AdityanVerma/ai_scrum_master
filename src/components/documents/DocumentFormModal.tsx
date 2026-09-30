"use client";

import { useState } from "react";
import Modal from "@/components/layout/Modal";

export type Document = {
    id: string;
    title: string;
    type: string;
    sourceType: "DOCUMENT" | "LINK" | "UPLOAD";
    content: string | null;
    url: string | null;
    source: "MANUAL" | "AI_GENERATED";
    createdAt: string;
    sprint: {
        id: string;
        name: string;
    } | null;
    // Null for documents added before sign-in existed.
    createdBy: {
        id: string;
        name: string;
    } | null;
    tags: {
        tag: {
            id: string;
            name: string;
        };
    }[];
};

type DocumentFormModalProps = {
    // Set to edit this document; leave out to add a new one.
    document?: Document;
    // Fixes the document to one sprint (sprint page).
    sprintId?: string;
    // Lets the user pick a sprint (documentation page).
    sprints?: { id: string; name: string }[];
    onClose: () => void;
    onSaved: (document: Document) => void;
};

// Rendered only while open, so the form starts fresh every time.
export default function DocumentFormModal({
    document,
    sprintId,
    sprints = [],
    onClose,
    onSaved,
}: DocumentFormModalProps) {
    const isEditing = Boolean(document);

    const [selectedSprintId, setSelectedSprintId] = useState(
        document?.sprint?.id ?? "",
    );
    const [documentTitle, setDocumentTitle] = useState(document?.title ?? "");
    const [documentType, setDocumentType] = useState(document?.type ?? "");
    const [documentSourceType, setDocumentSourceType] = useState<
        "DOCUMENT" | "LINK" | "UPLOAD"
    >(document?.sourceType ?? "DOCUMENT");
    const [documentContent, setDocumentContent] = useState(
        document?.content ?? "",
    );
    const [documentUrl, setDocumentUrl] = useState(document?.url ?? "");
    const [documentTags, setDocumentTags] = useState(
        document?.tags.map(({ tag }) => tag.name).join(", ") ?? "",
    );
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Adding sends form data (it can carry a file); editing sends JSON with
    // only the fields that can change.
    function createRequest(): Promise<Response> {
        const formData = new FormData();

        formData.append("title", documentTitle);
        formData.append("type", documentType);
        formData.append("sourceType", documentSourceType);
        formData.append("tagNames", documentTags);

        const targetSprintId = sprintId ?? selectedSprintId;

        if (targetSprintId) {
            formData.append("sprintId", targetSprintId);
        }

        if (documentSourceType === "DOCUMENT") {
            formData.append("content", documentContent);
        }

        if (documentSourceType === "LINK") {
            formData.append("url", documentUrl);
        }

        if (documentSourceType === "UPLOAD" && documentFile) {
            formData.append("file", documentFile);
        }

        return fetch("/api/documents", {
            method: "POST",
            body: formData,
        });
    }

    function updateRequest(existing: Document): Promise<Response> {
        return fetch(`/api/documents/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: documentTitle,
                type: documentType,
                tagNames: documentTags.split(","),
                ...(existing.sourceType === "DOCUMENT" && {
                    content: documentContent,
                }),
                ...(existing.sourceType === "LINK" && { url: documentUrl }),
                // On a sprint page the sprint stays as it is.
                ...(!sprintId && { sprintId: selectedSprintId || null }),
            }),
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (documentSourceType === "UPLOAD" && !documentFile) {
            setFormError("Please select a document to upload.");
            return;
        }

        setIsSaving(true);

        try {
            const response = document
                ? await updateRequest(document)
                : await createRequest();

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to save document.");
            }

            onSaved(result.data);
            onClose();
        } catch (error) {
            console.error("Failed to save document:", error);

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to save document.",
            );
            setIsSaving(false);
        }
    }

    return (
        <Modal title={isEditing ? "Edit Document" : "Add Document"} onClose={onClose}>
            <p className="mb-6 text-sm text-muted">
                {isEditing
                    ? "Update this document."
                    : sprintId
                        ? "Add documentation or an external reference to this sprint."
                        : "Add documentation or an external reference."}
            </p>

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <div>
                    <label htmlFor="doc-title" className="label">Document Title</label>

                    <input
                        id="doc-title"
                        type="text"
                        value={documentTitle}
                        onChange={(event) =>
                            setDocumentTitle(event.target.value)
                        }
                        placeholder="e.g. Sprint Requirements"
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="doc-type" className="label">Document Type</label>

                    <input
                        id="doc-type"
                        type="text"
                        value={documentType}
                        onChange={(event) =>
                            setDocumentType(event.target.value)
                        }
                        placeholder="e.g. Requirements, Design, Meeting Notes"
                        className="input"
                        required
                    />
                </div>

                {!sprintId && sprints.length > 0 && (
                    <div>
                        <label htmlFor="doc-sprint" className="label">Assign to Sprint</label>

                        <select
                            id="doc-sprint"
                            value={selectedSprintId}
                            onChange={(event) =>
                                setSelectedSprintId(event.target.value)
                            }
                            className="input"
                        >
                            <option value="">
                                General Documentation
                            </option>

                            {sprints.map((sprint) => (
                                <option key={sprint.id} value={sprint.id}>
                                    {sprint.name}
                                </option>
                            ))}
                        </select>

                        <p className="hint">
                            Choose a sprint or keep this as general
                            documentation.
                        </p>
                    </div>
                )}

                {/* A document cannot switch between text and link once added. */}
                {!isEditing && (
                    <div>
                        <label htmlFor="doc-source-type" className="label">Source Type</label>

                        <select
                            id="doc-source-type"
                            value={documentSourceType}
                            onChange={(event) =>
                                setDocumentSourceType(
                                    event.target.value as
                                    | "DOCUMENT"
                                    | "LINK"
                                    | "UPLOAD",
                                )
                            }
                            className="input"
                        >
                            <option value="DOCUMENT">Document Content</option>
                            <option value="LINK">External Link</option>
                            <option value="UPLOAD">Upload Document</option>
                        </select>
                    </div>
                )}

                {documentSourceType === "DOCUMENT" ? (
                    <div>
                        <label htmlFor="doc-content" className="label">Content</label>

                        <textarea
                            id="doc-content"
                            value={documentContent}
                            onChange={(event) =>
                                setDocumentContent(event.target.value)
                            }
                            placeholder="Write or paste the document content..."
                            rows={6}
                            className="input resize-y"
                            required
                        />
                    </div>
                ) : documentSourceType === "LINK" ? (
                    <div>
                        <label htmlFor="doc-url" className="label">Document URL</label>

                        <input
                            id="doc-url"
                            type="url"
                            value={documentUrl}
                            onChange={(event) =>
                                setDocumentUrl(event.target.value)
                            }
                            placeholder="https://example.com/document"
                            className="input"
                            required
                        />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="doc-file" className="label">Upload Document</label>

                        <input
                            id="doc-file"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.md"
                            onChange={(event) =>
                                setDocumentFile(event.target.files?.[0] ?? null)
                            }
                            className="input file:mr-4 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-strong"
                            required
                        />

                        <p className="hint">
                            Supported formats: PDF, DOC, DOCX, TXT, and Markdown.
                        </p>
                    </div>
                )}

                <div>
                    <label htmlFor="doc-tags" className="label">Tags</label>

                    <input
                        id="doc-tags"
                        type="text"
                        value={documentTags}
                        onChange={(event) =>
                            setDocumentTags(event.target.value)
                        }
                        placeholder="frontend, api, planning"
                        className="input"
                    />

                    <p className="hint">
                        Separate multiple tags using commas.
                    </p>
                </div>

                {formError && (
                    <p className="alert-error" role="alert">
                        {formError}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary"
                    >
                        {isSaving ? "Saving..." : "Save Document"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
