import { prisma } from '@/lib/prisma';
import type { SprintProposal } from '@/lib/ai/sprint-planning/build-sprint-proposal';

export async function saveSprintProposal(proposal: SprintProposal) {
  const sprint = await prisma.sprint.create({
    data: {
      name: proposal.name,
      goal: proposal.goal,
      startDate: new Date(proposal.duration.startDate),
      endDate: new Date(proposal.duration.endDate),
      totalEstimatedHours: proposal.totalEstimatedHours,

      tasks: {
        create: proposal.tasks.map((task) => ({
          taskId: task.id,
          title: task.title,
          description: task.description,
          complexity: task.complexity,
          estimatedHours: task.estimatedHours,

          skills: {
            create: task.skills.map((skill) => ({
              skill,
            })),
          },
        })),
      },
    },

    include: {
      tasks: {
        include: {
          skills: true,
        },
      },
    },
  });

  const taskIdMap = new Map(sprint.tasks.map((task) => [task.taskId, task.id]));

  const dependencies = proposal.tasks.flatMap((task) =>
    task.dependsOn.map((dependsOnTaskId) => ({
      taskId: taskIdMap.get(task.id),
      dependsOnTaskId: taskIdMap.get(dependsOnTaskId),
    })),
  );

  const validDependencies = dependencies.filter(
    (
      dependency,
    ): dependency is {
      taskId: string;
      dependsOnTaskId: string;
    } => Boolean(dependency.taskId) && Boolean(dependency.dependsOnTaskId),
  );

  if (validDependencies.length > 0) {
    await prisma.taskDependency.createMany({
      data: validDependencies,
    });
  }

  return prisma.sprint.findUniqueOrThrow({
    where: {
      id: sprint.id,
    },
    include: {
      tasks: {
        include: {
          skills: true,
          dependencies: true,
          dependedOnBy: true,
        },
      },
    },
  });
}
