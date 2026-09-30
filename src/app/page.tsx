import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { getCurrentMember } from "@/lib/auth/dal";

export default async function Home() {
  const member = await getCurrentMember();

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your sprints and team activity."
        action={
          // Planning a sprint is for the Scrum Master only.
          member?.accessRole === "SCRUM_MASTER" && (
            <Link href="/sprint-proposal" className="btn-primary">
              Create New Sprint
            </Link>
          )
        }
      />
    </PageContainer>
  );
}
