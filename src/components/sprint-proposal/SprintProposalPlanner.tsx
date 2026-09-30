"use client";

import { FormEvent, useState } from "react";
import type { SprintProposal } from "@/lib/ai/sprint-planning/build-sprint-proposal";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

type SprintInput = {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    functions: string;
};

export default function SprintProposalPlanner() {
    // States
    const [formData, setFormData] = useState<SprintInput>({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        functions: "",
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [sprintProposal, setSprintProposal] =
        useState<SprintProposal | null>(null);
    const [missingInformation, setMissingInformation] = useState<string[]>(
        [],
    );
    const [error, setError] = useState<string | null>(null);

    // Handle Change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError(null);
    };

    // Handle Submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError(null);
        setMissingInformation([]);
        setSprintProposal(null);

        if (formData.endDate < formData.startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        setIsGenerating(true);

        try {
            const sprintInput = {
                name: formData.name,
                goal: formData.goal,
                duration: {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                },
                functions: formData.functions
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
            };

            const response = await fetch("/api/sprint-planning", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sprintInput),
            });

            const contentType = response.headers.get("content-type");

            if (!contentType?.includes("application/json")) {
                throw new Error(
                    `Server returned an unexpected response (${response.status}).`,
                );
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to generate sprint proposal.",
                );
            }

            if (result.data.status === "READY") {
                setMissingInformation([]);
                setSprintProposal(result.data.sprintProposal);
            }

            if (result.data.status === "NEEDS_INFORMATION") {
                setSprintProposal(null);
                setMissingInformation(
                    result.data.requirementAnalysis.missingInformation ?? [],
                );
            }
        } catch (error) {
            console.error("Sprint planning failed:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while generating the sprint proposal.",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                eyebrow="Sprint Planning"
                title="Create Sprint Proposal"
                description="Define your sprint requirements and let the system generate a structured sprint proposal."
            />

            {/* Form Card */}
            <div className="card sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sprint Name */}
                    <div>
                        <label htmlFor="name" className="label">
                            Sprint Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Poll Manager Improvements"
                            required
                            className="input"
                        />
                    </div>

                    {/* Sprint Goal */}
                    <div>
                        <label htmlFor="goal" className="label">
                            Sprint Goal
                        </label>

                        <textarea
                            id="goal"
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            placeholder="What should this sprint achieve?"
                            rows={4}
                            required
                            className="input resize-none leading-6"
                        />
                    </div>

                    {/* Sprint Duration */}
                    <div>
                        <p className="label">Sprint Duration</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Start Date */}
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="hint mt-0 mb-1.5 block"
                                >
                                    Start Date
                                </label>

                                <input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="hint mt-0 mb-1.5 block"
                                >
                                    End Date
                                </label>

                                <input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    min={formData.startDate || undefined}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Functions */}
                    <div>
                        <label htmlFor="functions" className="label">
                            Functions / Features
                        </label>

                        <textarea
                            id="functions"
                            name="functions"
                            value={formData.functions}
                            onChange={handleChange}
                            placeholder={`Enter one function or feature per line.

Example:
Improve poll creation
Add poll result view
Add poll notifications`}
                            rows={8}
                            required
                            className="input resize-none leading-6"
                        />

                        <p className="hint">
                            Enter one function or feature per line.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end border-t border-line pt-6">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="btn-primary px-6 py-2.5"
                        >
                            {isGenerating
                                ? "Generating..."
                                : "Generate Proposal"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error */}
            {error && (
                <section className="alert-error mt-6">
                    <p className="font-semibold">
                        Failed to generate sprint proposal
                    </p>

                    <p className="mt-1">{error}</p>
                </section>
            )}

            {/* Missing Information */}
            {missingInformation.length > 0 && (
                <section className="mt-6 rounded-xl border border-line bg-brand-soft p-5 sm:p-6">
                    <p className="text-sm font-semibold text-brand-strong">
                        More Information Needed
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        Please provide more details before generating the
                        sprint proposal.
                    </p>

                    <ul className="mt-4 space-y-2">
                        {missingInformation.map((item, index) => (
                            <li key={index} className="flex gap-2 text-sm">
                                <span className="text-brand-strong">•</span>

                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Sprint Proposal */}
            {sprintProposal && (
                <section className="mt-8 space-y-6">
                    {/* Proposal Header */}
                    <div className="card sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-brand-strong uppercase">
                                    Sprint Proposal
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                    {sprintProposal.name}
                                </h2>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                                    {sprintProposal.goal}
                                </p>
                            </div>

                            <div className="shrink-0 rounded-lg bg-brand-soft px-4 py-3">
                                <p className="text-xs text-muted">
                                    Estimated effort
                                </p>

                                <p className="mt-1 text-lg font-semibold text-brand-strong">
                                    {sprintProposal.totalEstimatedHours} hours
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <span className="badge badge-brand">
                                {sprintProposal.duration.startDate}
                            </span>

                            <span className="text-xs text-muted">→</span>

                            <span className="badge badge-brand">
                                {sprintProposal.duration.endDate}
                            </span>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Tasks</h3>

                            <p className="mt-1 text-sm text-muted">
                                Work identified for this sprint.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {sprintProposal.tasks.map((task) => (
                                <div key={task.id} className="card">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-muted">
                                                {task.id}
                                            </p>

                                            <h4 className="mt-1 text-base font-semibold">
                                                {task.title}
                                            </h4>
                                        </div>

                                        <span
                                            className={`badge shrink-0 ${task.complexity === "HIGH"
                                                ? "badge-danger"
                                                : task.complexity === "MEDIUM"
                                                    ? "badge-warning"
                                                    : "badge-brand"
                                                }`}
                                        >
                                            {task.complexity}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-muted">
                                        {task.description}
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-semibold text-muted">
                                                Skills
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {task.skills.join(", ")}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-muted">
                                                Estimated Hours
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {task.estimatedHours} hours
                                            </p>
                                        </div>
                                    </div>

                                    {task.dependsOn.length > 0 && (
                                        <div className="mt-4 rounded-lg bg-canvas p-3">
                                            <p className="text-xs font-semibold text-muted">
                                                Dependencies
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {task.dependsOn.join(", ")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PageContainer>
    );
}
