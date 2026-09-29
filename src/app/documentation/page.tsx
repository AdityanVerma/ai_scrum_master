"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format-date";
import AddDocumentModal, {
    type Document,
} from "@/components/documents/AddDocumentModal";

export default function DocumentationPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [sprints, setSprints] = useState<
        { id: string; name: string }[]
    >([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch("/api/documents");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch documents.",
                    );
                }

                setDocuments(result.data);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await fetch("/api/sprints");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to fetch sprints.",
                    );
                }

                setSprints(
                    result.data.map(
                        (sprint: { id: string; name: string }) => ({
                            id: sprint.id,
                            name: sprint.name,
                        }),
                    ),
                );
            } catch (error) {
                console.error("Failed to fetch sprints:", error);
            }
        };

        fetchSprints();
    }, []);

    return (
        <PageContainer>
            <PageHeader
                title="Documentation"
                description="Manage and access all project documentation."
                action={
                    <button
                        type="button"
                        onClick={() => setIsDocumentFormOpen(true)}
                        className="btn-primary"
                    >
                        Add Document
                    </button>
                }
            />

            {isDocumentFormOpen && (
                <AddDocumentModal
                    sprints={sprints}
                    onClose={() => setIsDocumentFormOpen(false)}
                    onCreated={(document) =>
                        setDocuments((current) => [document, ...current])
                    }
                />
            )}

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Documents</h2>

                <span className="badge badge-brand">
                    {documents.length}{" "}
                    {documents.length === 1 ? "Document" : "Documents"}
                </span>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted">Loading documents...</p>
            ) : documents.length === 0 ? (
                <p className="empty-state">No documents available yet.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {documents.map((document) => (
                        <article
                            key={document.id}
                            className="card transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">
                                        {document.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-muted">
                                        {document.type}
                                    </p>

                                    {document.sprint && (
                                        <p className="mt-2 text-xs font-medium text-brand-strong">
                                            Sprint: {document.sprint.name}
                                        </p>
                                    )}
                                </div>

                                <span className="badge badge-brand">
                                    {document.sourceType}
                                </span>
                            </div>

                            {document.sourceType === "LINK" &&
                                document.url && (
                                    <a
                                        href={document.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 block truncate text-sm text-brand-strong underline"
                                    >
                                        {document.url}
                                    </a>
                                )}

                            {document.sourceType === "DOCUMENT" &&
                                document.content && (
                                    <p className="mt-4 line-clamp-3 text-sm text-muted">
                                        {document.content}
                                    </p>
                                )}

                            {document.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {document.tags.map(({ tag }) => (
                                        <span
                                            key={tag.id}
                                            className="badge badge-muted"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="mt-4 text-xs text-muted">
                                {formatDate(document.createdAt)}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
