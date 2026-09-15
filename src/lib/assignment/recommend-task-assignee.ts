import { getTaskAssignmentCandidates } from '@/lib/assignment/get-task-assignment-candidates';

export async function recommendTaskAssignee(taskId: string) {
  const candidates = await getTaskAssignmentCandidates(taskId);

  if (candidates.length === 0) {
    return {
      recommendedMember: null,
      candidates: [],
    };
  }

  return {
    recommendedMember: candidates[0],
    candidates,
  };
}
