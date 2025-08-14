export type SharePermission = 'VIEW' | 'EDIT';

// Request gửi email
export type ShareDocumentByEmailRequest = {
  documentId: number;
  emails: string[];
  message?: string;
  projectKey: string;
  permissionType: SharePermission;
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
};

export type ShareDocWireData = {
  success: boolean;
  failedEmails: string[];
};

export type ShareDocumentByEmailResult = {
  isSuccess: boolean;
  failedEmails: string[];
  message: string;
};
