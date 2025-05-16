import { CollectionPoint } from "@/types/collection";

export const mockCollectionPoints: CollectionPoint[] = [
  {
    id: "cp1",
    address: "123 Main St, District 1, HCMC",
    coordinates: {
      lat: 10.7756,
      lng: 106.7019
    },
    status: "pending",
    scheduledTime: "2024-03-20T09:00:00Z",
    binType: "plastic",
    binCapacity: 240,
    currentFillLevel: 85,
    imageUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=2338&auto=format&fit=crop",
    notes: "Behind the main building",
    collectorId: "col1",
    collectorName: "John Doe"
  },
  {
    id: "cp2",
    address: "456 Oak Ave, District 2, HCMC",
    coordinates: {
      lat: 10.7868,
      lng: 106.7511
    },
    status: "in_progress",
    scheduledTime: "2024-03-20T09:30:00Z",
    lastCollectedAt: "2024-03-13T09:25:00Z",
    nextCollectionAt: "2024-03-27T09:30:00Z",
    binType: "general",
    binCapacity: 240,
    currentFillLevel: 90,
    notes: "Next to the security booth",
    collectorId: "col1",
    collectorName: "John Doe"
  },
  {
    id: "cp3",
    address: "789 Pine St, District 3, HCMC",
    coordinates: {
      lat: 10.7800,
      lng: 106.6822
    },
    status: "completed",
    scheduledTime: "2024-03-20T08:00:00Z",
    lastCollectedAt: "2024-03-20T08:15:00Z",
    nextCollectionAt: "2024-03-27T08:00:00Z",
    binType: "organic",
    binCapacity: 240,
    currentFillLevel: 0,
    imageUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=2338&auto=format&fit=crop",
    notes: "Inside the parking lot",
    collectorId: "col1",
    collectorName: "John Doe"
  },
  {
    id: "cp4",
    address: "321 Maple Rd, District 1, HCMC",
    coordinates: {
      lat: 10.7731,
      lng: 106.7067
    },
    status: "missed",
    scheduledTime: "2024-03-19T15:00:00Z",
    binType: "plastic",
    binCapacity: 240,
    currentFillLevel: 100,
    notes: "Gate locked during scheduled time",
    collectorId: "col1",
    collectorName: "John Doe"
  },
  {
    id: "cp5",
    address: "654 Cedar Ln, District 4, HCMC",
    coordinates: {
      lat: 10.7579,
      lng: 106.7044
    },
    status: "cancelled",
    scheduledTime: "2024-03-20T10:30:00Z",
    binType: "general",
    binCapacity: 240,
    currentFillLevel: 75,
    notes: "Cancelled due to road construction",
    collectorId: "col1",
    collectorName: "John Doe"
  }
]; 