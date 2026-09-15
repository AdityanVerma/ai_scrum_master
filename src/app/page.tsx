import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";

export default function Home() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Dashboard
          </h1>

          <p className="mt-2 text-[#5F6B64]">
            Overview of your sprints and team activity.
          </p>
        </div>

        <Link
          href="/sprint-proposal"
          className="rounded-xl bg-[#8CC9A8] px-4 py-2 text-sm font-medium text-[#1F2924] transition hover:opacity-90"
        >
          Create New Sprint
        </Link>
      </div>
    </PageContainer>
  );
}