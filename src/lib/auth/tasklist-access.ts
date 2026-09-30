import { NextResponse } from "next/server";
import type { DailyTasklist } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession, type CurrentMember } from "@/lib/auth/dal";

type TasklistAccess =
  | { ok: true; member: CurrentMember; tasklist: DailyTasklist }
  | { ok: false; response: NextResponse };

function fail(status: number, error: string): TasklistAccess {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  };
}

// 'read': the tasklist's owner or the Scrum Master.
// 'write': the tasklist's owner only (the Scrum Master gets read-only access).
export async function requireTasklistAccess(
  tasklistId: string,
  mode: "read" | "write",
): Promise<TasklistAccess> {
  const auth = await requireSession();

  if (!auth.ok) {
    return auth;
  }

  const tasklist = await prisma.dailyTasklist.findUnique({
    where: { id: tasklistId },
  });

  if (!tasklist) {
    return fail(404, "Tasklist not found.");
  }

  const isOwner = tasklist.memberId === auth.member.id;

  if (mode === "write" && !isOwner) {
    return fail(403, "Only the owner of a tasklist can change it.");
  }

  if (
    mode === "read" &&
    !isOwner &&
    auth.member.accessRole !== "SCRUM_MASTER"
  ) {
    return fail(403, "You can only view your own tasklist.");
  }

  return { ok: true, member: auth.member, tasklist };
}
