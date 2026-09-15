import { prisma } from '@/lib/prisma';
import { getAssignmentCandidates } from '@/lib/assignment/get-assignment-candidates';

export async function getTaskAssignmentCandidates(taskId: string) {
  const task = await prisma.sprintTask.findUnique({
    where: {
      id: taskId,
    },
    include: {
      skills: true,
    },
  });

  if (!task) {
    throw new Error('Task not found.');
  }

  const requiredSkills = task.skills.map((skill) => skill.skill);

  if (requiredSkills.length === 0) {
    return [];
  }

  return getAssignmentCandidates(requiredSkills);
}
