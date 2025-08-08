export interface Account {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role?: string;
  position?: string;
  phone?: string;
  gender?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  address?: string;
  picture?: string;
  dateOfBirth?: string;
}

export interface RecipientNotification {
  id: number;
  accountId: number;
  notificationId: number;
  status: string | null;
  isRead: boolean;
  createdAt: string;

  // optional: preload info về account nếu API trả về
  account?: Account;
}

export interface NotificationType  {
  id: number;
  createdBy: number;
  type: 'MENTION' | 'DOCUMENT_UPDATE' | 'TASK_ASSIGN' | 'COMMENT' | string;
  priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | string;
  message: string;
  relatedEntityType: 'DOCUMENT' | 'TASK' | 'PROJECT' | string | null;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;

  createdByNavigation?: Account | null;
  recipientNotification: RecipientNotification[];
}
