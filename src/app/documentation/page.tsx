"use client";

import { useEffect, useState } from "react";

type Document = {
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

export default function DocumentationPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [sprints, setSprints] = useState<
        { id: string; name: string }[]
    >([]);

    const [selectedSprintId, setSelectedSprintId] =
        useState("");

    // Add document popup states
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

    const handleCreateDocument = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (documentSourceType === "UPLOAD" && !documentFile) {
            alert("Please select a document to upload.");
            return;
        }

        setIsCreatingDocument(true);

        try {
            const formData = new FormData();

            formData.append("title", documentTitle);
            formData.append("type", documentType);
            formData.append("sourceType", documentSourceType);
            formData.append("tagNames", documentTags);

            if (selectedSprintId) {
                formData.append("sprintId", selectedSprintId);
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

            setDocuments((current) => [result.data, ...current]);

            setDocumentTitle("");
            setDocumentType("");
            setDocumentSourceType("DOCUMENT");
            setDocumentContent("");
            setDocumentUrl("");
            setDocumentTags("");
            setDocumentFile(null);
            setSelectedSprintId("");
            setIsDocumentFormOpen(false);
        } catch (error) {
            console.error("Failed to create document:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create document.",
            );
        } finally {
            setIsCreatingDocument(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FBF9] p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#1F2924]">
                            Documentation
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Manage and access all project documentation.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsDocumentFormOpen(true)}
                        className="rounded-xl bg-[#8CC9A8] px-4 py-2.5 text-sm font-medium text-[#1F2924] transition hover:opacity-90"
                    >
                        Add Document
                    </button>

                    {isDocumentFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-[#1F2924]">
                                        Add Document
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() => setIsDocumentFormOpen(false)}
                                        className="text-2xl text-gray-500 transition hover:text-gray-800"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className="mb-6 text-sm text-gray-500">
                                    Add documentation or an external reference to this sprint.
                                </p>

                                <form
                                    onSubmit={handleCreateDocument}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Document Title
                                        </label>

                                        <input
                                            type="text"
                                            value={documentTitle}
                                            onChange={(event) =>
                                                setDocumentTitle(event.target.value)
                                            }
                                            placeholder="e.g. Sprint Requirements"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Document Type
                                        </label>

                                        <input
                                            type="text"
                                            value={documentType}
                                            onChange={(event) =>
                                                setDocumentType(event.target.value)
                                            }
                                            placeholder="e.g. Requirements, Design, Meeting Notes"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Assign to Sprint
                                        </label>

                                        <select
                                            value={selectedSprintId}
                                            onChange={(event) =>
                                                setSelectedSprintId(event.target.value)
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
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

                                        <p className="mt-1 text-xs text-gray-500">
                                            Choose a sprint or keep this as general documentation.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Source Type
                                        </label>

                                        <select
                                            value={documentSourceType}
                                            onChange={(event) =>
                                                setDocumentSourceType(
                                                    event.target.value as
                                                    | "DOCUMENT"
                                                    | "LINK"
                                                    | "UPLOAD",
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                        >
                                            <option value="DOCUMENT">Document Content</option>
                                            <option value="LINK">External Link</option>
                                            <option value="UPLOAD">Upload Document</option>
                                        </select>
                                    </div>

                                    {documentSourceType === "DOCUMENT" ? (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Content
                                            </label>

                                            <textarea
                                                value={documentContent}
                                                onChange={(event) =>
                                                    setDocumentContent(event.target.value)
                                                }
                                                placeholder="Write or paste the document content..."
                                                rows={6}
                                                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                                required
                                            />
                                        </div>
                                    ) : documentSourceType === "LINK" ? (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Document URL
                                            </label>

                                            <input
                                                type="url"
                                                value={documentUrl}
                                                onChange={(event) =>
                                                    setDocumentUrl(event.target.value)
                                                }
                                                placeholder="https://example.com/document"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                                Upload Document
                                            </label>

                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt,.md"
                                                onChange={(event) =>
                                                    setDocumentFile(event.target.files?.[0] ?? null)
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#E8F6EF] file:px-4 file:py-2 file:text-sm file:font-medium"
                                                required
                                            />

                                            <p className="mt-1 text-xs text-gray-500">
                                                Supported formats: PDF, DOC, DOCX, TXT, and Markdown.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[#1F2924]">
                                            Tags
                                        </label>

                                        <input
                                            type="text"
                                            value={documentTags}
                                            onChange={(event) =>
                                                setDocumentTags(event.target.value)
                                            }
                                            placeholder="frontend, api, planning"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-[#8CC9A8]"
                                        />

                                        <p className="mt-1 text-xs text-gray-500">
                                            Separate multiple tags using commas.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsDocumentFormOpen(false)}
                                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isCreatingDocument}
                                            className="rounded-xl bg-[#8CC9A8] px-5 py-2.5 text-sm font-medium text-[#1F2924] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isCreatingDocument ? "Saving..." : "Save Document"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <section className="mt-8 rounded-2xl border border-[#E5EEE8] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#1F2924]">
                            All Documents
                        </h2>

                        <span className="rounded-full bg-[#E8F6EF] px-3 py-1 text-sm font-medium text-[#1F2924]">
                            {documents.length}{" "}
                            {documents.length === 1 ? "Document" : "Documents"}
                        </span>
                    </div>

                    <div className="mt-8">
                        {isLoading ? (
                            <div className="rounded-xl bg-[#F5FAF7] px-6 py-12 text-center">
                                <p className="text-gray-500">
                                    Loading documents...
                                </p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="rounded-xl bg-[#F5FAF7] px-6 py-12 text-center">
                                <p className="text-gray-500">
                                    No documents available yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {documents.map((document) => (
                                    <article
                                        key={document.id}
                                        className="rounded-xl border border-[#E5EEE8] p-5 transition hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-[#1F2924]">
                                                    {document.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {document.type}
                                                </p>

                                                {document.sprint && (
                                                    <p className="mt-2 text-xs font-medium text-green-700">
                                                        Sprint: {document.sprint.name}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="rounded-full bg-[#E8F6EF] px-2.5 py-1 text-xs font-medium text-[#1F2924]">
                                                {document.sourceType}
                                            </span>
                                        </div>

                                        {document.sourceType === "LINK" &&
                                            document.url && (
                                                <a
                                                    href={document.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-4 block truncate text-sm text-green-700 underline"
                                                >
                                                    {document.url}
                                                </a>
                                            )}

                                        {document.sourceType === "DOCUMENT" &&
                                            document.content && (
                                                <p className="mt-4 line-clamp-3 text-sm text-gray-600">
                                                    {document.content}
                                                </p>
                                            )}

                                        {document.tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {document.tags.map(({ tag }) => (
                                                    <span
                                                        key={tag.id}
                                                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                                    >
                                                        #{tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="mt-4 text-xs text-gray-400">
                                            {new Date(
                                                document.createdAt,
                                            ).toLocaleDateString()}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}