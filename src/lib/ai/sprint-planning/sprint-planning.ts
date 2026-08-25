import { analyzeDependencies } from '@/lib/ai/sprint-planning/dependency-analysis';
import { analyzeRequirements } from '@/lib/ai/sprint-planning/requirement-analysis';
import { identifySkills } from '@/lib/ai/sprint-planning/skill-identification';
import { breakDownTasks } from '@/lib/ai/sprint-planning/task-breakdown';
import { estimateTasks } from '@/lib/ai/sprint-planning/task-estimation';
import { validateDependencies } from '@/lib/ai/sprint-planning/dependency-validation';
import { correctDependencies } from '@/lib/ai/sprint-planning/dependency-correction';

export type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function planSprint(sprintInput: SprintInput) {
  // 1. Analyze requirements
  const requirementAnalysis = await analyzeRequirements(sprintInput);

  // Stop if requirements are insufficient
  if (!requirementAnalysis.isSufficient) {
    return {
      status: 'NEEDS_INFORMATION' as const,
      requirementAnalysis,
    };
  }

  // 2. Break requirements into tasks
  const taskBreakdown = await breakDownTasks(sprintInput);

  // 3. Analyze task dependencies
  const dependencyAnalysis = await analyzeDependencies(taskBreakdown.tasks);

  // 4. Validate dependencies
  const dependencyValidation = await validateDependencies(
    taskBreakdown.tasks,
    dependencyAnalysis.dependencies,
  );

  // 5. Correct invalid dependencies
  let finalDependencies = dependencyAnalysis.dependencies;

  let dependencyCorrection = null;

  if (!dependencyValidation.isValid) {
    dependencyCorrection = await correctDependencies(
      taskBreakdown.tasks,
      dependencyAnalysis.dependencies,
      dependencyValidation.issues,
    );

    finalDependencies = dependencyCorrection.dependencies;
  }

  // 6. Identify required skills
  const skillIdentification = await identifySkills(taskBreakdown.tasks);

  // 7. Estimate task effort
  const taskEstimation = await estimateTasks(
    taskBreakdown.tasks,
    skillIdentification.taskSkills,
  );

  return {
    status: 'READY' as const,
    requirementAnalysis,
    taskBreakdown,
    dependencyAnalysis,
    dependencyValidation,
    dependencyCorrection,
    finalDependencies,
    skillIdentification,
    taskEstimation,
  };
}
