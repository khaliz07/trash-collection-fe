// Feedback status
export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved';

// Feedback type
export type FeedbackType = 'complaint' | 'suggestion' | 'proposal';

// Sender type
export type FeedbackSenderType = 'citizen' | 'collector';

export interface FeedbackSender {
  id: string;
  name: string;
  role: FeedbackSenderType;
}

export interface FeedbackAttachment {
  id: string;
  url: string;
  type: 'image' | 'document';
  name?: string;
}

export interface Feedback {
  id: string;
  code: string;
  createdAt: string; // ISO date
  sender: FeedbackSender;
  channel: 'auto' | 'manual';
  type: FeedbackType;
  content: string;
  relatedScheduleId?: string;
  status: FeedbackStatus;
  handler?: { id: string; name: string };
  handledAt?: string;
  attachments?: FeedbackAttachment[];
  priority?: 'normal' | 'urgent';
  updatedAt?: string;
  notes?: string;
}

export interface FeedbackFilter {
  dateRange?: [string, string];
  area?: string;
  status?: FeedbackStatus;
  senderType?: FeedbackSenderType;
  type?: FeedbackType;
  keyword?: string;
  priority?: 'urgent' | 'normal';
}

export interface FeedbackStats {
  total: number;
  resolved: number;
  byType: Record<FeedbackType, number>;
  urgent: number;
  month: string;
}
