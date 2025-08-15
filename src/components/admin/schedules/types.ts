export type ScheduleStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ScheduleCollector {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  rating: number;
  reviewCount: number;
}

export interface ScheduleReview {
  id: string;
  collectorId: string;
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ScheduleAttachment {
  id: string;
  name: string;
  url: string;
}

export interface SchedulePoint {
  id: string;
  lat: number;
  lng: number;
  address: string;
  type: "start" | "end" | "normal";
}

export interface ScheduleRoute {
  points: SchedulePoint[];
}

export interface Schedule {
  id: string;
  code: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  note?: string;
  attachments?: ScheduleAttachment[];
  collector: ScheduleCollector;
  route: ScheduleRoute;
}
