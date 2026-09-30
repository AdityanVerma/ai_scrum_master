import { redirect } from "next/navigation";
import NotAllowed from "@/components/auth/NotAllowed";
import SprintProposalPlanner from "@/components/sprint-proposal/SprintProposalPlanner";
import { getCurrentMember } from "@/lib/auth/dal";

// Plan Sprint makes paid AI calls, so it is for the Scrum Master only. The
// planning API routes check the role as well; this decides what the page shows.
export default async function SprintProposalPage() {
  const member = await getCurrentMember();

  // A cookie that is expired, forged or belongs to a deactivated member.
  if (!member) {
    redirect("/login");
  }

  if (member.accessRole !== "SCRUM_MASTER") {
    return <NotAllowed message="Planning a sprint is only for the Scrum Master." />;
  }

  return <SprintProposalPlanner />;
}
