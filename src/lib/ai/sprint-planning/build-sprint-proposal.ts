export type SprintProposalTask = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedHours: number;
  dependsOn: string[];
};

export type SprintProposal = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  tasks: SprintProposalTask[];
  totalEstimatedHours: number;
};

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

type Task = {
  id: string;
  title: string;
  description: string;
};

type TaskSkills = {
  taskId: string;
  skills: string[];
  reasoning: string;
};

type TaskEstimate = {
  taskId: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedHours: number;
  reasoning: string;
};

type Dependency = {
  taskId: string;
  dependsOn: string[];
  reason: string;
};

type BuildSprintProposalInput = {
  sprintInput: SprintInput;
  tasks: Task[];
  taskSkills: TaskSkills[];
  estimates: TaskEstimate[];
  dependencies: Dependency[];
};

export function buildSprintProposal({
  sprintInput,
  tasks,
  taskSkills,
  estimates,
  dependencies,
}: BuildSprintProposalInput): SprintProposal {
  const proposalTasks: SprintProposalTask[] = tasks.map((task) => {
    const skills = taskSkills.find((item) => item.taskId === task.id);

    const estimate = estimates.find((item) => item.taskId === task.id);

    const dependency = dependencies.find((item) => item.taskId === task.id);

    if (!estimate) {
      throw new Error(`Missing estimate for task ${task.id}`);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      skills: skills?.skills ?? [],
      complexity: estimate.complexity,
      estimatedHours: estimate.estimatedHours,
      dependsOn: dependency?.dependsOn ?? [],
    };
  });

  const totalEstimatedHours = proposalTasks.reduce(
    (total, task) => total + task.estimatedHours,
    0,
  );

  return {
    name: sprintInput.name,
    goal: sprintInput.goal,
    duration: sprintInput.duration,
    tasks: proposalTasks,
    totalEstimatedHours,
  };
}
