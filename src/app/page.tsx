import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">
          Sprint Planning Agent
        </h1>

        <p className="mt-2 text-gray-600">
          AI-assisted sprint planning
        </p>

        <Link
          href="/sprint-proposal"
          className="mt-6 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
        >
          Create Sprint Proposal
        </Link>
      </div>
    </main>
  );
}