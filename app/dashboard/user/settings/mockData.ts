// Mock data for user settings page

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

export const mockUserInfo: UserInfo = {
  name: 'Nguyễn Văn A',
  phone: '0912345678',
  address: '123 Đường A, Phường B, Quận C',
  email: 'nguyenvana@example.com',
  avatarUrl: '/avatars/user1.png',
  status: 'active',
};

export const mockNotificationSettings: NotificationSettings = {
  schedule: true,
  policy: true,
  system: false,
  channel: 'in-app',
};

export const mockLanguage: Language = 'vi';

export const mockDevices: DeviceSession[] = [
  {
    id: 'dev1',
    device: 'iPhone 14 Pro',
    location: 'Hà Nội, Việt Nam',
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: 'dev2',
    device: 'Laptop Windows',
    location: 'Hồ Chí Minh, Việt Nam',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    current: false,
  },
  {
    id: 'dev3',
    device: 'iPad Air',
    location: 'Đà Nẵng, Việt Nam',
    lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    current: false,
  },
]; 