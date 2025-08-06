// Mock data for user support page

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'payment' | 'schedule' | 'account' | 'issue' | 'other';
}

export interface SupportRequest {
  id: string;
  type: 'payment' | 'schedule' | 'issue' | 'account' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string; // ISO
  feedback?: SupportFeedback;
}

export interface SupportFeedback {
  stars: number;
  comment?: string;
  date: string; // ISO
}

export const mockFAQ: FAQItem[] = [
  {
    id: 'faq1',
    question: 'Làm sao để thanh toán phí dịch vụ?',
    answer: 'Bạn có thể thanh toán qua VNPay, Momo hoặc chuyển khoản ngân hàng.',
    category: 'payment',
  },
  {
    id: 'faq2',
    question: 'Làm sao để xem lịch thu gom?',
    answer: 'Bạn vào mục "Lịch thu gom rác" trên dashboard để xem chi tiết.',
    category: 'schedule',
  },
  {
    id: 'faq3',
    question: 'Tôi quên mật khẩu, phải làm sao?',
    answer: 'Bạn hãy sử dụng chức năng quên mật khẩu trên màn hình đăng nhập.',
    category: 'account',
  },
  {
    id: 'faq4',
    question: 'App bị lỗi không đăng nhập được?',
    answer: 'Bạn hãy thử cập nhật app lên phiên bản mới nhất hoặc liên hệ hỗ trợ.',
    category: 'issue',
  },
];

export const mockSupportRequests: SupportRequest[] = [
  {
    id: 'req1',
    type: 'payment',
    title: 'Không nhận được hóa đơn sau khi thanh toán',
    description: 'Tôi đã thanh toán nhưng không thấy hóa đơn trong lịch sử.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req2',
    type: 'schedule',
    title: 'Lịch thu gom bị sai khu vực',
    description: 'Lịch thu gom hiển thị không đúng với địa chỉ của tôi.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    feedback: {
      stars: 5,
      comment: 'Hỗ trợ rất nhanh và nhiệt tình!',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'req3',
    type: 'issue',
    title: 'App bị crash khi mở lịch sử',
    description: 'Mỗi lần vào mục lịch sử là app bị thoát ra.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    // Chưa feedback
  },
  {
    id: 'req4',
    type: 'other',
    title: 'Muốn thay đổi số điện thoại đăng nhập',
    description: 'Tôi muốn cập nhật số điện thoại mới.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]; 