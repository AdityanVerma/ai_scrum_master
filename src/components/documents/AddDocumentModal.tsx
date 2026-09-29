"use client";

import { useEffect, useState } from "react";

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
    tags: {
        tag: {
            id: string;
            name: string;
        };
    }[];
};

type AddDocumentModalProps = {
    // Fixes the document to one sprint (sprint page).
    sprintId?: string;
    // Lets the user pick a sprint (documentation page).
    sprints?: { id: string; name: string }[];
    onClose: () => void;
    onCreated: (document: Document) => void;
};

// Rendered only while open, so the form starts empty every time.
export default function AddDocumentModal({
    sprintId,
    sprints = [],
    onClose,
    onCreated,
}: AddDocumentModalProps) {
    const [selectedSprintId, setSelectedSprintId] = useState("");
    const [documentTitle, setDocumentTitle] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documentSourceType, setDocumentSourceType] = useState<
        "DOCUMENT" | "LINK" | "UPLOAD"
    >("DOCUMENT");
    const [documentContent, setDocumentContent] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [documentTags, setDocumentTags] = useState("");
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (documentSourceType === "UPLOAD" && !documentFile) {
            setFormError("Please select a document to upload.");
            return;
        }

        setIsCreatingDocument(true);

        try {
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

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to create document.",
                );
            }

            onCreated(result.data);
            onClose();
        } catch (error) {
            console.error("Failed to create document:", error);

            setFormError(
                error instanceof Error
                    ? error.message
                    : "Failed to create document.",
            );
            setIsCreatingDocument(false);
        }
    }

    return (
        <div className="modal-backdrop">
            <div
                className="modal-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-document-title"
            >
                <div className="mb-2 flex items-center justify-between">
                    <h2 id="add-document-title" className="text-xl font-semibold">
                        Add Document
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-2xl leading-none text-muted transition-colors hover:text-ink"
                    >
                        ×
                    </button>
                </div>

                <p className="mb-6 text-sm text-muted">
                    {sprintId
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
                            disabled={isCreatingDocument}
                            className="btn-primary"
                        >
                            {isCreatingDocument ? "Saving..." : "Save Document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
