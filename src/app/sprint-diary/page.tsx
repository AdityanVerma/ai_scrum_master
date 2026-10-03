import { redirect } from "next/navigation";
import NotAllowed from "@/components/auth/NotAllowed";
import SprintDiaryEditor from "@/components/sprint-diary/SprintDiaryEditor";
import { getCurrentMember } from "@/lib/auth/dal";

// The Daily Sprint Diary is prepared and published by the Scrum Master. The
// diary API checks the role as well; this decides what the page shows.
export default async function SprintDiaryPage() {
  const member = await getCurrentMember();

  // A cookie that is expired, forged or belongs to a deactivated member.
  if (!member) {
    redirect("/login");
  }

  if (member.accessRole !== "SCRUM_MASTER") {
    return <NotAllowed message="The Sprint Diary is only for the Scrum Master." />;
  }

  return <SprintDiaryEditor />;
}
