// Wrapper chung cho mọi API


export type DocumentVisibility = 'MAIN' | 'PRIVATE';

export type DocumentType = {
  id: number;
  projectId: number;
  taskId: string | null;
  epicId: string | null;
  subtaskId: string | null;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  visibility: DocumentVisibility;
};
