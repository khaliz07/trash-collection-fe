import type { UserInfo, NotificationSettings, Language, DeviceSession } from './types';

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