// src/types/document.ts (hoặc file hiện tại của bạn)

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

export type CreateDocumentRequest = {
  projectId: number;
  title: string;
  visibility: DocumentVisibility;
  content?: string; 
  taskId?: string | null;
  epicId?: string | null;
  subtaskId?: string | null;
};
