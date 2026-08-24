export type SprintTask = {
  title: string;
  description: string;
  skills: string[];
  dependencies: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type SprintProposal = {
  sprintGoal: string;
  summary: string;
  tasks: SprintTask[];
  risks: string[];
};
