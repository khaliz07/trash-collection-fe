export type SupportRequestType =
  | "PAYMENT"
  | "SCHEDULE"
  | "ACCOUNT"
  | "TECHNICAL_ISSUE"
  | "OTHER";
export type SupportRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";
export type SupportPriority = "NORMAL" | "HIGH" | "URGENT";
export type FAQCategory =
  | "PAYMENT"
  | "SCHEDULE"
  | "ACCOUNT"
  | "TECHNICAL_ISSUE"
  | "OTHER";

export interface SupportRequest {
  id: string;
  userId: string;
  type: SupportRequestType;
  title: string;
  description: string;
  status: SupportRequestStatus;
  priority: SupportPriority;
  attachments: string[];
  images: string[]; // Base64 encoded images
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  handlerId?: string;
  adminNotes?: string;
  adminResponse?: string; // Admin's response to user
  adminResponseAt?: string; // When admin responded
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  handler?: {
    id: string;
    name: string;
    email: string;
  };
  feedback?: SupportFeedback;
}

export interface SupportFeedback {
  id: string;
  supportRequestId: string;
  rating: number;
  comment?: string;
  images: string[]; // Base64 encoded images
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportRequestPayload {
  type: SupportRequestType;
  title: string;
  description: string;
  priority?: SupportPriority;
  attachments?: string[];
  images?: string[]; // Base64 encoded images
}

export interface UpdateSupportRequestPayload {
  status?: SupportRequestStatus;
  adminNotes?: string;
  priority?: SupportPriority;
  adminResponse?: string; // Admin's response to user
}

export interface CreateSupportFeedbackPayload {
  rating: number;
  comment?: string;
  images?: string[]; // Base64 encoded images
}
