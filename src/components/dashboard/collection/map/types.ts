import { CollectionPoint, CollectionStatus } from '@/types/collection';

export interface MapFilter {
  status: CollectionStatus[];
  search: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
} 