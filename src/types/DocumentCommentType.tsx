export type DocumentComment = {
  id: number;
  documentId: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  fromPos: number;
  toPos: number;
  content: string;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
};

export interface CreateCommentRequest {
  documentId: number;
  fromPos: number;
  toPos: number;
  content: string;
  comment: string;
}

