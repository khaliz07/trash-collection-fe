# API Documentation và Data Models Chi tiết

## 1. Data Models Chi tiết

### 1.1. User Models

#### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;            // Họ tên chủ hộ
  email: string;           // Email đăng nhập
  phone: string;           // SĐT (dùng cho OTP)
  address: {
    street: string;        // Số nhà, tên đường  
    ward: string;          // Phường/Xã
    district: string;      // Quận/Huyện
    city: string;          // Tỉnh/Thành phố
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  servicePackage: ServicePackage;
  accountStatus: 'active' | 'suspended' | 'pending';
  registrationDate: string; // ISO date
  lastPayment?: string;     // ISO date
}

interface ServicePackage {
  id: string;
  name: string;            // "Gói cơ bản", "Gói nâng cao"
  type: 'monthly' | 'quarterly' | 'yearly';
  price: number;           // VND
  features: string[];      // ["Thu gom 3 lần/tuần", "Hỗ trợ 24/7"]
  urgentRequestLimit: number; // Số lần được yêu cầu gấp/tháng
}
```

#### CollectionSchedule (User View)
```typescript
interface CollectionSchedule {
  id: string;
  userId: string;
  date: string;            // ISO date
  timeSlot: {
    start: string;         // "09:00"
    end: string;           // "11:00"
  };
  type: 'regular' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  address: string;         // Địa chỉ thu gom
  wasteType?: string;      // "Rác thải sinh hoạt", "Rác tái chế"
  specialInstructions?: string;
  assignedCollector?: {
    id: string;
    name: string;
    phone: string;
  };
  completionDetails?: {
    completedAt: string;   // ISO datetime
    photo?: string;        // URL ảnh chứng minh
    note?: string;
    collectorNote?: string;
  };
  feedback?: CollectionFeedback;
}

interface CollectionFeedback {
  id: string;
  stars: number;           // 1-5
  comment?: string;
  aspectRatings?: {
    punctuality: number;   // 1-5
    friendliness: number;  // 1-5
    thoroughness: number;  // 1-5
  };
  submittedAt: string;     // ISO datetime
}
```

#### UrgentCollectionRequest
```typescript
interface UrgentCollectionRequest {
  id: string;
  userId: string;
  requestedDate: string;   // ISO date
  preferredTimeSlot?: {
    start: string;
    end: string;
  };
  wasteType: string;
  urgencyLevel: 'medium' | 'high' | 'critical';
  reason: string;          // Lý do yêu cầu gấp
  specialInstructions?: string;
  status: 'pending' | 'accepted' | 'assigned' | 'completed' | 'rejected';
  assignedCollector?: {
    id: string;
    name: string;
    phone: string;
    estimatedArrival?: string; // ISO datetime
  };
  requestedAt: string;     // ISO datetime
  responseTime?: number;   // Minutes từ lúc request đến khi accept
}
```

### 1.2. Collector Models

#### CollectorProfile
```typescript
interface CollectorProfile {
  id: string;
  employeeCode: string;    // Mã nhân viên
  name: string;
  phone: string;
  email?: string;
  avatar?: string;         // URL ảnh đại diện
  workZones: WorkZone[];   // Các khu vực được phân công
  vehicle: {
    type: 'truck' | 'motorbike' | 'bicycle';
    plateNumber: string;
    capacity: number;      // Kg
  };
  workSchedule: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    startTime: string;     // "06:00"
    endTime: string;       // "14:00"  
  };
  status: 'active' | 'on_leave' | 'suspended';
  rating: {
    average: number;       // 1-5
    totalReviews: number;
  };
  startDate: string;       // ISO date
}

interface WorkZone {
  id: string;
  name: string;           // "Quận 1", "Phường Linh Trung"
  coordinates: {
    lat: number;
    lng: number;
  }[];                    // Polygon boundaries
  estimatedHouseholds: number;
}
```

#### CollectionPoint (Collector View)
```typescript
interface CollectionPoint {
  id: string;
  scheduleId: string;      // Link tới lịch trình tổng
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  user: {
    id: string;
    name: string;
    phone: string;
    specialNotes?: string; // Ghi chú đặc biệt (vị trí thùng rác, etc.)
  };
  scheduledTime: string;   // ISO datetime
  wasteType: string;
  estimatedWeight?: number; // Kg
  priority: 'normal' | 'high' | 'urgent';
  requiresPhoto: boolean;
  status: CollectionStatus;
  
  // Collection progress tracking
  checkInTime?: string;    // ISO datetime
  checkInLocation?: {
    lat: number;
    lng: number;
  };
  startCollectionTime?: string;
  completionTime?: string;
  collectionPhoto?: string;
  collectorNote?: string;
  actualWeight?: number;
  
  // Issues tracking
  issues?: {
    type: 'no_access' | 'incorrect_waste' | 'excessive_amount' | 'other';
    description: string;
    photo?: string;
  }[];
}

enum CollectionStatus {
  PENDING = 'pending',           // Chưa bắt đầu
  EN_ROUTE = 'en_route',        // Đang trên đường đến
  ARRIVED = 'arrived',          // Đã đến nơi
  IN_PROGRESS = 'in_progress',  // Đang thu gom
  COMPLETED = 'completed',      // Hoàn thành
  CANNOT_COLLECT = 'cannot_collect', // Không thể thu gom
  SKIPPED = 'skipped'           // Bỏ qua
}
```

#### DailyRoute
```typescript
interface DailyRoute {
  id: string;
  collectorId: string;
  date: string;            // ISO date
  shift: 'morning' | 'afternoon' | 'evening';
  totalPoints: number;
  completedPoints: number;
  estimatedDuration: number; // Minutes
  actualDuration?: number;
  
  // Route optimization
  optimizedOrder: string[];  // Array of CollectionPoint IDs
  estimatedDistance: number; // Km
  actualDistance?: number;
  
  // Performance metrics
  startTime?: string;      // ISO datetime
  endTime?: string;
  averageTimePerPoint?: number; // Minutes
  onTimeRate?: number;     // Percentage
  
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  collectionPoints: CollectionPoint[];
}
```

### 1.3. Admin Models

#### SystemStats
```typescript
interface SystemStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    churnRate: number;     // Percentage
  };
  collectors: {
    total: number;
    active: number;
    onDuty: number;
    averageRating: number;
  };
  collections: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    completionRate: number; // Percentage
  };
  revenue: {
    today: number;
    thisMonth: number;
    projection: number;    // Dự báo cuối tháng
    growth: number;        // Percentage vs last month
  };
}
```

#### PaymentManagement
```typescript
interface UserPayment {
  id: string;
  userId: string;
  userName: string;
  householdCode: string;   // Mã hộ gia đình
  address: string;
  servicePackage: {
    name: string;
    price: number;
  };
  billingPeriod: {
    id: string;
    label: string;         // "Tháng 5/2024"
    startDate: string;     // ISO date
    endDate: string;
  };
  amount: number;          // VND
  paymentMethod?: 'cash' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  status: 'paid' | 'unpaid' | 'overdue' | 'partial';
  dueDate: string;         // ISO date
  paidAt?: string;         // ISO datetime
  receiptUrl?: string;
  
  // Payment history
  transactions: {
    id: string;
    amount: number;
    method: string;
    transactionId?: string; // From payment gateway
    paidAt: string;
  }[];
  
  // Late payment tracking
  reminders: {
    sentAt: string;
    type: 'email' | 'sms' | 'push';
    acknowledged: boolean;
  }[];
}

interface CollectorPayment {
  id: string;
  collectorId: string;
  collectorName: string;
  employeeCode: string;
  workZone: string;
  
  payrollPeriod: {
    id: string;
    label: string;         // "Tháng 5/2024"
    startDate: string;
    endDate: string;
  };
  
  // Performance metrics
  totalShifts: number;
  completedCollections: number;
  totalWeight: number;     // Kg
  averageRating: number;
  bonusEligible: boolean;
  
  // Salary calculation
  baseSalary: number;
  performanceBonus: number;
  overtimeHours: number;
  overtimePay: number;
  deductions: number;      // Penalties, etc.
  totalAmount: number;
  
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  approvedBy?: string;     // Admin user ID
  approvedAt?: string;
  paidAt?: string;
  
  // Supporting documents
  timesheets: {
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: number;
    collections: number;
  }[];
  
  evidence: {
    type: 'timesheet' | 'completion_photo' | 'weight_record';
    url: string;
    uploadedAt: string;
  }[];
}
```

#### ScheduleManagement
```typescript
interface MasterSchedule {
  id: string;
  name: string;           // "Lịch Thu Gom Tháng 6/2024"
  period: {
    startDate: string;    // ISO date
    endDate: string;
  };
  status: 'draft' | 'published' | 'active' | 'completed';
  
  // Zone-based scheduling
  zones: {
    id: string;
    name: string;
    households: number;
    assignedCollectors: string[]; // Collector IDs
    schedulePattern: {
      monday?: TimeSlot[];
      tuesday?: TimeSlot[];
      wednesday?: TimeSlot[];
      thursday?: TimeSlot[];
      friday?: TimeSlot[];
      saturday?: TimeSlot[];
      sunday?: TimeSlot[];
    };
  }[];
  
  // Resource allocation
  vehicleAssignments: {
    vehicleId: string;
    collectorId: string;
    zones: string[];
  }[];
  
  createdBy: string;      // Admin user ID
  createdAt: string;
  publishedAt?: string;
  
  // Performance tracking
  stats?: {
    totalScheduled: number;
    totalCompleted: number;
    averageCompletionTime: number;
    customerSatisfaction: number;
  };
}

interface TimeSlot {
  start: string;          // "09:00"
  end: string;            // "11:00"  
  capacity: number;       // Max households
  assigned: number;       // Currently assigned
}
```

#### ReportsAndAnalytics
```typescript
interface RevenueReport {
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
  };
  
  // Revenue breakdown
  userPayments: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    paymentMethodBreakdown: {
      method: string;
      amount: number;
      percentage: number;
    }[];
  };
  
  // Cost breakdown
  operatingCosts: {
    collectorSalaries: number;
    vehicleMaintenance: number;
    fuel: number;
    equipment: number;
    other: number;
  };
  
  // Profitability
  grossProfit: number;
  netProfit: number;
  profitMargin: number;   // Percentage
  
  // Trends
  growth: {
    revenue: number;      // Percentage vs previous period
    users: number;
    collections: number;
  };
}

interface OperationalReport {
  period: {
    startDate: string;
    endDate: string;
  };
  
  // Collection metrics
  collections: {
    total: number;
    completed: number;
    missed: number;
    cancelled: number;
    urgent: number;
    completionRate: number; // Percentage
    averageResponseTime: number; // Minutes for urgent requests
  };
  
  // Collector performance
  collectors: {
    total: number;
    averageRating: number;
    averageCollectionsPerDay: number;
    topPerformers: {
      id: string;
      name: string;
      collections: number;
      rating: number;
    }[];
    performanceIssues: {
      id: string;
      name: string;
      issues: string[];
    }[];
  };
  
  // Service quality
  customerFeedback: {
    averageRating: number;
    totalReviews: number;
    satisfactionRate: number; // Percentage of 4+ star ratings
    commonComplaints: {
      category: string;
      count: number;
    }[];
  };
  
  // Geographic analysis
  zonePerformance: {
    zoneId: string;
    zoneName: string;
    collections: number;
    completionRate: number;
    averageRating: number;
    revenue: number;
  }[];
}
```

## 2. API Endpoints Structure

### 2.1. Authentication Endpoints

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  role: 'user' | 'collector' | 'admin';
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// POST /api/auth/register
interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

// POST /api/auth/otp/send
interface OTPRequest {
  phone: string;
}

// POST /api/auth/otp/verify
interface OTPVerifyRequest {
  phone: string;
  code: string;
}
```

### 2.2. User Endpoints

```typescript
// GET /api/user/profile
interface UserProfileResponse {
  user: UserProfile;
  servicePackage: ServicePackage;
  nextCollection?: CollectionSchedule;
  stats: {
    totalCollections: number;
    completionRate: number;
    urgentRequestsUsed: number;
    urgentRequestsLimit: number;
  };
}

// GET /api/user/schedule?month=2024-06
interface ScheduleResponse {
  schedules: CollectionSchedule[];
  summary: {
    total: number;
    completed: number;
    upcoming: number;
    missed: number;
  };
}

// POST /api/user/urgent-request
interface UrgentRequestRequest {
  preferredDate: string;
  timeSlot?: { start: string; end: string; };
  wasteType: string;
  urgencyLevel: 'medium' | 'high' | 'critical';
  reason: string;
  specialInstructions?: string;
}

// POST /api/user/feedback
interface FeedbackRequest {
  collectionId: string;
  stars: number;
  comment?: string;
  aspectRatings?: {
    punctuality: number;
    friendliness: number;
    thoroughness: number;
  };
}
```

### 2.3. Collector Endpoints

```typescript
// GET /api/collector/route/today
interface TodayRouteResponse {
  route: DailyRoute;
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
  };
  notifications: {
    id: string;
    type: 'urgent_request' | 'schedule_change' | 'system';
    message: string;
    createdAt: string;
  }[];
}

// POST /api/collector/checkin
interface CheckinRequest {
  collectionPointId: string;
  location: {
    lat: number;
    lng: number;
  };
  photo?: string; // Base64 or file upload
  note?: string;
}

// PUT /api/collector/collection/:id/status
interface UpdateStatusRequest {
  status: CollectionStatus;
  note?: string;
  photo?: string;
  issues?: {
    type: string;
    description: string;
    photo?: string;
  }[];
  actualWeight?: number;
}

// GET /api/collector/performance?period=month
interface PerformanceResponse {
  summary: {
    totalCollections: number;
    completionRate: number;
    averageTimePerCollection: number;
    customerRating: number;
    totalReviews: number;
  };
  trends: {
    date: string;
    collections: number;
    onTime: number;
    late: number;
    missed: number;
  }[];
  ranking: {
    position: number;
    totalCollectors: number;
    scoreBreakdown: {
      efficiency: number;
      customerSatisfaction: number;
      reliability: number;
    };
  };
}
```

### 2.4. Admin Endpoints

```typescript
// GET /api/admin/dashboard
interface AdminDashboardResponse {
  stats: SystemStats;
  recentActivity: {
    id: string;
    type: 'user_registration' | 'payment_received' | 'complaint' | 'system_alert';
    description: string;
    timestamp: string;
    severity?: 'info' | 'warning' | 'error';
  }[];
  alerts: {
    id: string;
    type: 'payment_overdue' | 'collector_absent' | 'system_error';
    message: string;
    count: number;
    urgency: 'low' | 'medium' | 'high';
  }[];
}

// GET /api/admin/users?page=1&limit=20&search=&status=
interface UsersListResponse {
  users: (UserProfile & {
    collections: { total: number; completed: number; };
    payments: { current: 'paid' | 'unpaid' | 'overdue'; amount: number; };
    lastActivity: string;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// PUT /api/admin/user/:id
interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: UserProfile['address'];
  servicePackage?: string;
  accountStatus?: 'active' | 'suspended' | 'pending';
}

// GET /api/admin/collectors?page=1&limit=20
interface CollectorsListResponse {
  collectors: (CollectorProfile & {
    currentRoute?: { id: string; totalPoints: number; completedPoints: number; };
    todayStats: { collections: number; completionRate: number; };
    monthStats: { totalCollections: number; rating: number; };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// POST /api/admin/schedule
interface CreateScheduleRequest {
  name: string;
  period: { startDate: string; endDate: string; };
  zones: {
    id: string;
    assignedCollectors: string[];
    schedulePattern: MasterSchedule['zones'][0]['schedulePattern'];
  }[];
}

// GET /api/admin/payments/users?period=&status=&page=1
interface UserPaymentsResponse {
  payments: UserPayment[];
  summary: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    totalAmount: number;
    collectedAmount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// GET /api/admin/reports/revenue?period=month&startDate=&endDate=
interface RevenueReportResponse {
  report: RevenueReport;
  charts: {
    dailyRevenue: { date: string; amount: number; }[];
    paymentMethods: { method: string; amount: number; percentage: number; }[];
    zoneRevenue: { zone: string; amount: number; }[];
  };
}
```

## 3. Database Schema (Conceptual)

### 3.1. Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'collector', 'admin') NOT NULL,
  status ENUM('active', 'suspended', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address_street VARCHAR(255),
  address_ward VARCHAR(100),
  address_district VARCHAR(100), 
  address_city VARCHAR(100),
  coordinates_lat DECIMAL(10,8),
  coordinates_lng DECIMAL(11,8),
  service_package_id UUID REFERENCES service_packages(id),
  registration_date DATE,
  last_payment_date DATE
);

-- Service packages table  
CREATE TABLE service_packages (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  urgent_request_limit INTEGER DEFAULT 0,
  features JSON,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collectors table
CREATE TABLE collectors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  work_zones JSON, -- Array of zone IDs
  vehicle_type ENUM('truck', 'motorbike', 'bicycle'),
  vehicle_plate VARCHAR(20),
  vehicle_capacity INTEGER,
  work_schedule JSON,
  status ENUM('active', 'on_leave', 'suspended') DEFAULT 'active',
  start_date DATE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Collection schedules table
CREATE TABLE collection_schedules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  collector_id UUID REFERENCES collectors(id),
  date DATE NOT NULL,
  time_start TIME,
  time_end TIME,
  type ENUM('regular', 'urgent') DEFAULT 'regular',
  status ENUM('scheduled', 'in_progress', 'completed', 'missed', 'cancelled') DEFAULT 'scheduled',
  address TEXT,
  waste_type VARCHAR(100),
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection completions table
CREATE TABLE collection_completions (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES collection_schedules(id),
  completed_at TIMESTAMP,
  photo_url VARCHAR(500),
  collector_note TEXT,
  actual_weight DECIMAL(5,2),
  issues JSON -- Array of issue objects
);

-- Collection feedback table
CREATE TABLE collection_feedback (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES collection_schedules(id),
  user_id UUID REFERENCES users(id),
  collector_id UUID REFERENCES collectors(id),
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  friendliness_rating INTEGER CHECK (friendliness_rating >= 1 AND friendliness_rating <= 5),
  thoroughness_rating INTEGER CHECK (thoroughness_rating >= 1 AND thoroughness_rating <= 5),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Urgent requests table
CREATE TABLE urgent_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  requested_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  waste_type VARCHAR(100),
  urgency_level ENUM('medium', 'high', 'critical'),
  reason TEXT NOT NULL,
  special_instructions TEXT,
  status ENUM('pending', 'accepted', 'assigned', 'completed', 'rejected') DEFAULT 'pending',
  assigned_collector_id UUID REFERENCES collectors(id),
  estimated_arrival TIMESTAMP,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_time_minutes INTEGER
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  due_date DATE,
  payment_method ENUM('cash', 'bank_transfer', 'momo', 'zalopay', 'vnpay'),
  status ENUM('paid', 'unpaid', 'overdue', 'partial') DEFAULT 'unpaid',
  paid_at TIMESTAMP,
  transaction_id VARCHAR(100),
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collector payroll table
CREATE TABLE collector_payroll (
  id UUID PRIMARY KEY,
  collector_id UUID REFERENCES collectors(id),
  period_start DATE,
  period_end DATE,
  total_shifts INTEGER,
  completed_collections INTEGER,
  total_weight DECIMAL(8,2),
  base_salary DECIMAL(10,2),
  performance_bonus DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  status ENUM('pending', 'approved', 'paid', 'disputed') DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  paid_at TIMESTAMP
);
```

### 3.2. Indexes để tối ưu performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role_status ON users(role, status);

-- Collection schedules
CREATE INDEX idx_schedules_user_date ON collection_schedules(user_id, date);
CREATE INDEX idx_schedules_collector_date ON collection_schedules(collector_id, date);
CREATE INDEX idx_schedules_date_status ON collection_schedules(date, status);

-- Geographic queries
CREATE INDEX idx_user_profiles_coordinates ON user_profiles(coordinates_lat, coordinates_lng);

-- Payment queries  
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_period ON payments(billing_period_start, billing_period_end);

-- Performance analytics
CREATE INDEX idx_feedback_collector_date ON collection_feedback(collector_id, submitted_at);
CREATE INDEX idx_completions_date ON collection_completions(completed_at);
```

## 4. Error Handling

### 4.1. Standard Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;           // "VALIDATION_ERROR", "NOT_FOUND", etc.
    message: string;        // Human readable message
    details?: any;          // Additional error details
    timestamp: string;      // ISO datetime
    requestId: string;      // For tracking
  };
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
```

### 4.2. Common Error Codes

```typescript
enum ErrorCodes {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED', 
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic
  URGENT_REQUEST_LIMIT_EXCEEDED = 'URGENT_REQUEST_LIMIT_EXCEEDED',
  SCHEDULE_CONFLICT = 'SCHEDULE_CONFLICT',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  SERVICE_SUSPENDED = 'SERVICE_SUSPENDED',
  
  // System
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

## 5. Realtime Updates

### 5.1. WebSocket Events

```typescript
// Client subscribes to events
interface SocketSubscription {
  userId: string;
  role: 'user' | 'collector' | 'admin';
  channels: string[]; // ['collections', 'payments', 'notifications']
}

// Collection status updates
interface CollectionStatusEvent {
  type: 'collection_status_update';
  data: {
    collectionId: string;
    oldStatus: CollectionStatus;
    newStatus: CollectionStatus;
    collectorId: string;
    timestamp: string;
    location?: { lat: number; lng: number; };
  };
}

// Urgent request events
interface UrgentRequestEvent {
  type: 'urgent_request_created' | 'urgent_request_accepted';
  data: {
    requestId: string;
    userId: string;
    collectorId?: string;
    estimatedArrival?: string;
    timestamp: string;
  };
}

// Payment events
interface PaymentEvent {
  type: 'payment_received' | 'payment_overdue';
  data: {
    paymentId: string;
    userId: string;
    amount: number;
    method?: string;
    timestamp: string;
  };
}
```

### 5.2. Push Notifications

```typescript
interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string;
  data?: {
    type: 'collection_reminder' | 'payment_due' | 'urgent_accepted' | 'feedback_request';
    actionUrl?: string;   // Deep link
    collectionId?: string;
    paymentId?: string;
  };
  scheduledFor?: string; // ISO datetime for delayed sends
  sent: boolean;
  sentAt?: string;
}
```

---

*Tài liệu này định nghĩa chi tiết cấu trúc dữ liệu và API endpoints cho hệ thống EcoCollect. Việc implementation thực tế sẽ tùy thuộc vào backend framework được chọn (Node.js/Express, Python/Django, etc.)*
