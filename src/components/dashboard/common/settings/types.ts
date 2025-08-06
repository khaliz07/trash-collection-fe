export interface UserInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  avatarUrl?: string;
  status: 'active' | 'disabled';
}

export interface NotificationSettings {
  schedule: boolean;
  policy: boolean;
  system: boolean;
  channel: 'in-app' | 'email' | 'sms';
}

export interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: string; // ISO
  current: boolean;
}

export type Language = 'vi' | 'en'; 