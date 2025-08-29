export interface TaskState {
  id: string;
  taskId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  suggestedRole: string;
  assignedMembers: ProjectMemberWithPositions[];
}

export interface ProjectMemberWithPositions {
  accountId: number;
  fullName: string;
  picture?: string;
}

export interface GetProjectMembersWithPositionsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectMemberWithPositions[];
  message: string;
}

export interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
  backendEpicId?: string;
}