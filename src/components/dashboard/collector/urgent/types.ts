export enum UrgentRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
}

export interface UrgentRequest {
  id: string;
  createdAt: string;
  address: string;
  wasteType: string;
  estimatedWeight: string;
  note?: string;
  status: UrgentRequestStatus;
  fee?: number;
  userName?: string;
  collectorId?: string;
  collectorName?: string;
  completedPhotoUrl?: string;
} 