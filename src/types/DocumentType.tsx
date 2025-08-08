export type DocumentType = {
  id: number;
  projectId: number;
  taskId?: string;
  epicId?: string;
  subTaskId?: string;

  title: string;
  type: string;
  content: string;
  template: string;
  status: string;
  visibility: string; // 'MAIN' | 'ARCHIVE' | 'TRASH'

  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;

  isActive: boolean;
  fileUrl?: string | null;
};
