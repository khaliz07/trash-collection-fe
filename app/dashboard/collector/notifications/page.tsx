import { NotificationList } from '@/components/dashboard/common/notifications/NotificationList';
import { mockNotifications } from '@/components/dashboard/common/notifications/mockData';

export default function CollectorNotificationsPage() {
  return <NotificationList notifications={mockNotifications} markAllLabel="Đánh dấu tất cả đã đọc" />;
} 