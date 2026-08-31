"use client";

import { FormEvent, useState } from "react";

type SprintInput = {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    functions: string;
};

type SprintTask = {
    title: string;
    description: string;
    skills: string[];
    dependencies: string[];
    complexity: "LOW" | "MEDIUM" | "HIGH";
};

type SprintProposal = {
    sprintGoal: string;
    summary: string;
    tasks: SprintTask[];
    risks: string[];
};

export default function SprintProposalPage() {
    const [formData, setFormData] = useState<SprintInput>({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        functions: "",
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [proposal, setProposal] = useState<SprintProposal | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to generate sprint proposal.",
                );
            }

            console.log("Sprint Planning Result:", result);

        } catch (error) {
            console.error("Sprint planning failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-semibold">Create Sprint Proposal</h1>

                <p className="mt-2 text-sm text-gray-600">
                    Provide the sprint requirements to generate a proposal.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* Sprint Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium"
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
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />
                    </div>

                    {/* Sprint Goal */}
                    <div>
                        <label
                            htmlFor="goal"
                            className="mb-2 block text-sm font-medium"
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
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />
                    </div>

                    {/* Sprint Duration */}
                    <div>
                        <p className="mb-2 block text-sm font-medium">Sprint Duration</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="mb-1 block text-xs text-gray-600"
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
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="mb-1 block text-xs text-gray-600"
                                >
                                    End Date
                                </label>

                                <input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Functions */}
                    <div>
                        <label
                            htmlFor="functions"
                            className="mb-2 block text-sm font-medium"
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
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Enter one function or feature per line.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isGenerating ? "Generating..." : "Generate Proposal"}
                    </button>
                </form>

                {proposal && (
                    <section className="mt-10 space-y-6 border-t pt-8">
                        <div>
                            <h2 className="text-xl font-semibold">Sprint Proposal</h2>

                            <p className="mt-2 text-sm text-gray-600">
                                {proposal.summary}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold">Sprint Goal</h3>

                            <p className="mt-1 text-sm text-gray-700">
                                {proposal.sprintGoal}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold">Tasks</h3>

                            <div className="mt-3 space-y-4">
                                {proposal.tasks.map((task, index) => (
                                    <div
                                        key={`${task.title}-${index}`}
                                        className="rounded-md border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <h4 className="font-medium">
                                                {index + 1}. {task.title}
                                            </h4>

                                            <span className="text-xs font-medium">
                                                {task.complexity}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-600">
                                            {task.description}
                                        </p>

                                        <div className="mt-3">
                                            <p className="text-xs font-medium">Skills</p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {task.skills.join(", ")}
                                            </p>
                                        </div>

                                        {task.dependencies.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-medium">Dependencies</p>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    {task.dependencies.join(", ")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {proposal.risks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold">Risks</h3>

                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                                    {proposal.risks.map((risk, index) => (
                                        <li key={index}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}