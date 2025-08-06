export enum CollectionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANNOT_COLLECT = 'CANNOT_COLLECT'
}

export interface Location {
  lat: number;
  lng: number;
}

export interface CollectionPoint {
  id: string;
  address: string;
  scheduledTime: string;
  wasteType: string;
  specialNotes?: string;
  status: CollectionStatus;
  requiresPhoto: boolean;
  location: Location;
  checkInTime?: string;
  checkInLocation?: Location;
  photo?: string;
  note?: string;
}

export interface Collector {
  id: string;
  name: string;
  zone: string;
  vehicle: string;
}

export interface CollectionPointFilters {
  zone?: string;
  status?: CollectionStatus;
  timeRange?: [string, string];
}

export interface CollectionPointSortOption {
  field: 'scheduledTime' | 'status' | 'address';
  direction: 'asc' | 'desc';
} 