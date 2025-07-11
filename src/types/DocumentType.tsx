export type DocumentType = {
  id: number;
  projectId: number;
  taskId?: string;
  epicId?: string;
  subTaskId?: string;

  title: string;
  type: string;
  content: string;
  updatedAt: string;
  template: string;
  updatedBy: number;
};
