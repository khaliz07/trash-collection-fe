export type CollectorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CollectorArea {
  id: string;
  name: string;
}

export interface Collector {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  licensePlate?: string | null; // Biển số xe
  status: CollectorStatus;
  role: string;
  avatar?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
    startDate: string; // ISO
  rating: number; // 1-5
  reviewCount: number;
  cccd: string;
}

export interface CollectorReview {
  id: string;
  collectorId: string;
  user: string; // ẩn hoặc mã hóa nếu cần
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO
}

export interface CollectorPerformance {
  collectorId: string;
  totalCollections: number;
  onTimeRate: number; // %
  reviewCount: number;
  avgRating: number;
}

export interface CollectorHistory {
  collectorId: string;
  date: string; // ISO
  event: string;
  detail?: string;
} 