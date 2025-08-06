export interface NotificationItem {
  id: string;
  type: 'policy' | 'schedule' | 'system' | 'environment';
  title: string;
  summary: string;
  content: string;
  sentAt: string; // ISO
  read: boolean;
  attachmentUrl?: string;
} 