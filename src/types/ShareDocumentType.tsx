export type SharePermission = 'VIEW';

export type ShareDocumentByEmailRequest = {
  documentId: number;
  emails: string[];
  message?: string;
  projectKey: string;
  permissionType: SharePermission;
};

export type ShareDocumentByEmailResult = {
  success: boolean;
  failedEmails: string[];
};
