"use client";

import { FormEvent, useState } from "react";
import type { SprintProposal } from "@/lib/ai/sprint-planning/build-sprint-proposal";

type SprintInput = {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    functions: string;
};

export default function SprintProposalPage() {
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
        <main className="min-h-screen bg-[#F8F7F2] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Page Header */}
                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-[#4E9F7C]">
                        Sprint Planning
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-[#1F2924]">
                        Create Sprint Proposal
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736D]">
                        Define your sprint requirements and let the system
                        generate a structured sprint proposal.
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-[#E4E5DF] bg-white p-6 shadow-sm sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Sprint Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-[#26312C]"
                            >
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
                                className="w-full rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-sm text-[#1F2924] outline-none transition placeholder:text-[#A0A8A3] focus:border-[#78C9A3] focus:ring-4 focus:ring-[#A8E6CF]/30"
                            />
                        </div>

                        {/* Sprint Goal */}
                        <div>
                            <label
                                htmlFor="goal"
                                className="mb-2 block text-sm font-medium text-[#26312C]"
                            >
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
                                className="w-full resize-none rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-sm leading-6 text-[#1F2924] outline-none transition placeholder:text-[#A0A8A3] focus:border-[#78C9A3] focus:ring-4 focus:ring-[#A8E6CF]/30"
                            />
                        </div>

                        {/* Sprint Duration */}
                        <div>
                            <div className="mb-3">
                                <p className="text-sm font-medium text-[#26312C]">
                                    Sprint Duration
                                </p>

                                <p className="mt-1 text-xs text-[#7A8580]">
                                    Select when the sprint starts and ends.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Start Date */}
                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="mb-2 block text-xs font-medium text-[#66736D]"
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
                                        className="w-full rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-sm text-[#1F2924] outline-none transition focus:border-[#78C9A3] focus:ring-4 focus:ring-[#A8E6CF]/30"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label
                                        htmlFor="endDate"
                                        className="mb-2 block text-xs font-medium text-[#66736D]"
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
                                        className="w-full rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-sm text-[#1F2924] outline-none transition focus:border-[#78C9A3] focus:ring-4 focus:ring-[#A8E6CF]/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Functions */}
                        <div>
                            <label
                                htmlFor="functions"
                                className="mb-2 block text-sm font-medium text-[#26312C]"
                            >
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
                                className="w-full resize-none rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-sm leading-6 text-[#1F2924] outline-none transition placeholder:text-[#A0A8A3] focus:border-[#78C9A3] focus:ring-4 focus:ring-[#A8E6CF]/30"
                            />

                            <p className="mt-2 text-xs text-[#7A8580]">
                                Enter one function or feature per line.
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end border-t border-[#ECEDE8] pt-6">
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="rounded-xl bg-[#A8E6CF] px-6 py-3 text-sm font-semibold text-[#1F2924] shadow-sm transition hover:bg-[#91D8B9] focus:outline-none focus:ring-4 focus:ring-[#A8E6CF]/40 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm font-semibold text-red-800">
                            Failed to generate sprint proposal
                        </p>

                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </section>
                )}

                {/* Missing Information */}
                {missingInformation.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-[#D7E8DF] bg-[#F0FAF5] p-6">
                        <div>
                            <p className="text-sm font-semibold text-[#315C49]">
                                More Information Needed
                            </p>

                            <p className="mt-1 text-sm text-[#5D756A]">
                                Please provide more details before generating
                                the sprint proposal.
                            </p>
                        </div>

                        <ul className="mt-4 space-y-2">
                            {missingInformation.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex gap-2 text-sm text-[#40564D]"
                                >
                                    <span className="mt-0.5 text-[#4E9F7C]">
                                        •
                                    </span>

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
                        <div className="rounded-2xl border border-[#D7E8DF] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4E9F7C]">
                                        Sprint Proposal
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1F2924]">
                                        {sprintProposal.name}
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66736D]">
                                        {sprintProposal.goal}
                                    </p>
                                </div>

                                <div className="shrink-0 rounded-xl bg-[#F0FAF5] px-4 py-3">
                                    <p className="text-xs text-[#66736D]">
                                        Estimated effort
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-[#315C49]">
                                        {sprintProposal.totalEstimatedHours}{" "}
                                        hours
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="rounded-full bg-[#F0FAF5] px-3 py-1.5 text-xs font-medium text-[#4E9F7C]">
                                    {sprintProposal.duration.startDate}
                                </span>

                                <span className="self-center text-xs text-[#9AA39E]">
                                    →
                                </span>

                                <span className="rounded-full bg-[#F0FAF5] px-3 py-1.5 text-xs font-medium text-[#4E9F7C]">
                                    {sprintProposal.duration.endDate}
                                </span>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-[#1F2924]">
                                    Tasks
                                </h3>

                                <p className="mt-1 text-sm text-[#7A8580]">
                                    Work identified for this sprint.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {sprintProposal.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="rounded-2xl border border-[#E4E5DF] bg-white p-5 shadow-sm transition hover:border-[#C9DDD3]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-[#8A948F]">
                                                    {task.id}
                                                </p>

                                                <h4 className="mt-1 text-base font-semibold text-[#26312C]">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${task.complexity === "HIGH"
                                                        ? "bg-[#FCECEC] text-[#A54D4D]"
                                                        : task.complexity ===
                                                            "MEDIUM"
                                                            ? "bg-[#FFF5DD] text-[#94713A]"
                                                            : "bg-[#F0FAF5] text-[#4E9F7C]"
                                                    }`}
                                            >
                                                {task.complexity}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-[#66736D]">
                                            {task.description}
                                        </p>

                                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#ECEDE8] pt-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-semibold text-[#7A8580]">
                                                    Skills
                                                </p>

                                                <p className="mt-1 text-sm text-[#40564D]">
                                                    {task.skills.join(", ")}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-[#7A8580]">
                                                    Estimated Hours
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-[#40564D]">
                                                    {task.estimatedHours} hours
                                                </p>
                                            </div>
                                        </div>

                                        {task.dependsOn.length > 0 && (
                                            <div className="mt-4 rounded-xl bg-[#F8F7F2] p-3">
                                                <p className="text-xs font-semibold text-[#7A8580]">
                                                    Dependencies
                                                </p>

                                                <p className="mt-1 text-sm text-[#596761]">
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
            </div>
        </main>
    );
}