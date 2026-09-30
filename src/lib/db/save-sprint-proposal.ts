import { prisma } from '@/lib/prisma';
import type { SprintProposal } from '@/lib/ai/sprint-planning/build-sprint-proposal';
import { normalizeFunctionName, sumHours } from '@/lib/sprint-functions';

// The total is added up here from the tasks that are left, not taken from
// the page.
export type SprintProposalToSave = Omit<SprintProposal, 'totalEstimatedHours'>;

// Saves the proposal the Scrum Master accepted on the Plan Sprint preview,
// after removing any tasks they did not want. Everything is written in one
// transaction, so a failure leaves no half-saved sprint.
export async function saveSprintProposal(proposal: SprintProposalToSave) {
  const startDate = new Date(proposal.duration.startDate);
  const endDate = new Date(proposal.duration.endDate);

  if (endDate < startDate) {
    throw new Error('End date cannot be before start date.');
  }

  const functionKeys = proposal.functions.map(normalizeFunctionName);

  if (new Set(functionKeys).size !== functionKeys.length) {
    throw new Error('Two functions cannot have the same name.');
  }

  if (
    new Set(proposal.tasks.map((task) => task.id)).size !==
    proposal.tasks.length
  ) {
    throw new Error('Two tasks cannot have the same id.');
  }

  const unknownFunction = proposal.tasks.find(
    (task) =>
      task.functionName !== null &&
      !proposal.functions.includes(task.functionName),
  );

  if (unknownFunction) {
    throw new Error(
      `Task ${unknownFunction.id} belongs to a function that is not in this sprint.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const sprint = await tx.sprint.create({
      data: {
        name: proposal.name,
        goal: proposal.goal,
        startDate,
        endDate,
        totalEstimatedHours: sumHours(proposal.tasks),
      },
    });

    const functions = await tx.sprintFunction.createManyAndReturn({
      data: proposal.functions.map((name) => ({
        name,
        sprintId: sprint.id,
      })),
      select: { id: true, name: true },
    });

    const functionIds = new Map(functions.map((item) => [item.name, item.id]));

    const tasks = await tx.sprintTask.createManyAndReturn({
      data: proposal.tasks.map((task) => ({
        sprintId: sprint.id,
        taskId: task.id,
        title: task.title,
        description: task.description,
        complexity: task.complexity,
        estimatedHours: task.estimatedHours,
        category: task.category,
        functionId: task.functionName
          ? functionIds.get(task.functionName)
          : null,
      })),
      select: { id: true, taskId: true },
    });

    const taskIds = new Map(tasks.map((task) => [task.taskId, task.id]));

    // Skills and dependencies are unique per task, so repeats are dropped.
    // Dependencies on tasks removed from the preview are dropped as well.
    const skills = proposal.tasks.flatMap((task) =>
      [...new Set(task.skills)].map((skill) => ({
        taskId: getId(taskIds, task.id),
        skill,
      })),
    );

    const dependencies = proposal.tasks.flatMap((task) =>
      [...new Set(task.dependsOn)]
        .filter((dependsOn) => dependsOn !== task.id && taskIds.has(dependsOn))
        .map((dependsOn) => ({
          taskId: getId(taskIds, task.id),
          dependsOnTaskId: getId(taskIds, dependsOn),
        })),
    );

    if (skills.length > 0) {
      await tx.taskSkill.createMany({ data: skills });
    }

    if (dependencies.length > 0) {
      await tx.taskDependency.createMany({ data: dependencies });
    }

    return sprint;
  });
}

function getId(taskIds: Map<string, string>, taskId: string) {
  const id = taskIds.get(taskId);

  if (!id) {
    throw new Error(`Task ${taskId} was not saved.`);
  }

  return id;
}
