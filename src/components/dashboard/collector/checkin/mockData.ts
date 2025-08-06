import { CheckInData, CheckInConfig } from './types';

export const mockCheckInData: CheckInData = {
  checkedIn: false,
  // checkInTime: '2024-06-01T07:15:00',
  // location: { lat: 10.729567, lng: 106.694255 },
  // photoUrl: '/images/checkin-demo.jpg',
};

export const mockCheckInConfig: CheckInConfig = {
  requirePhoto: true,
  allowedTimeRange: ['06:00', '09:00'],
}; 