export interface CheckInData {
  checkedIn: boolean;
  checkInTime?: string;
  location?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
}

export interface CheckInConfig {
  requirePhoto: boolean;
  allowedTimeRange?: [string, string]; // ['06:00', '09:00']
} 