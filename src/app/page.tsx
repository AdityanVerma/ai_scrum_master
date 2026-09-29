import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default function Home() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your sprints and team activity."
        action={
          <Link href="/sprint-proposal" className="btn-primary">
            Create New Sprint
          </Link>
        }
      />
    </PageContainer>
  );
}
