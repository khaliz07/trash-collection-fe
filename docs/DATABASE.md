# Database Schema & Business Logic Documentation

## 1. Tổng quan Database Design

### 1.1. Kiến trúc Database
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │   COLLECTORS    │    │     ADMINS      │
│                 │    │                 │    │                 │
│ - Authentication│    │ - Work Zones    │    │ - System Mgmt   │
│ - Profile Info  │    │ - Performance   │    │ - Analytics     │
│ - Service Plans │    │ - Vehicle Info  │    │ - Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────────────────────────┐
         │            COLLECTION SYSTEM              │
         │                                           │
         │ ┌─────────────┐ ┌─────────────────────┐   │
         │ │  SCHEDULES  │ │   COLLECTION_POINTS │   │
         │ │             │ │                     │   │
         │ │ - Master    │ │ - Daily Tasks       │   │
         │ │ - Templates │ │ - GPS Tracking      │   │
         │ │ - Zones     │ │ - Status Updates    │   │
         │ └─────────────┘ └─────────────────────┘   │
         │                                           │
         │ ┌─────────────┐ ┌─────────────────────┐   │
         │ │  PAYMENTS   │ │     FEEDBACK        │   │
         │ │             │ │                     │   │
         │ │ - User Bills│ │ - Ratings           │   │
         │ │ - Collector │ │ - Comments          │   │
         │ │   Payroll   │ │ - Issue Reports     │   │
         │ └─────────────┘ └─────────────────────┘   │
         └───────────────────────────────────────────┘
```

### 1.2. Primary Database Tables

#### Core Entity Tables
```sql
-- System users (All roles)
users
user_profiles 
service_packages
```

#### Collection Management Tables
```sql
-- Scheduling system
collection_schedules
master_schedules
schedule_templates
work_zones

-- Daily operations  
collection_points
collection_completions
urgent_requests
route_optimizations
```

#### Financial Management Tables
```sql
-- User billing
user_payments
payment_transactions
service_subscriptions

-- Collector payroll
collector_payroll
payroll_periods
performance_bonuses
```

#### Quality & Analytics Tables
```sql
-- Feedback system
collection_feedback
issue_reports
customer_satisfaction

-- System analytics
system_metrics
performance_analytics
usage_statistics
```

## 2. Chi tiết Schema Tables

### 2.1. User Management Schema

#### users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'collector', 'admin') NOT NULL DEFAULT 'user',
  status ENUM('active', 'suspended', 'pending', 'inactive') NOT NULL DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone),
  INDEX idx_users_role_status (role, status),
  INDEX idx_users_created_at (created_at)
);
```

**Ý nghĩa các field**:
- `id`: UUID làm primary key để tránh enumeration attacks
- `email`, `phone`: Dùng cho authentication, cả 2 đều unique
- `password_hash`: Hash của password (bcrypt/argon2)
- `role`: Phân quyền hệ thống 
- `status`: Trạng thái tài khoản (active để sử dụng)
- `email_verified`, `phone_verified`: Xác thực 2FA
- `failed_login_attempts`, `locked_until`: Security protection
- `last_login_at`: Tracking user activity

#### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  
  -- Address information
  address_street VARCHAR(255) NOT NULL,
  address_ward VARCHAR(100) NOT NULL,
  address_district VARCHAR(100) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_postal_code VARCHAR(20),
  
  -- Geographic coordinates for route optimization
  coordinates_lat DECIMAL(10,8),
  coordinates_lng DECIMAL(11,8),
  address_verified BOOLEAN DEFAULT FALSE,
  
  -- Service information
  service_package_id UUID REFERENCES service_packages(id),
  registration_date DATE NOT NULL,
  service_start_date DATE,
  last_payment_date DATE,
  
  -- Preferences
  preferred_collection_time ENUM('morning', 'afternoon', 'evening'),
  notification_preferences JSON, -- {"email": true, "sms": true, "push": true}
  special_instructions TEXT,
  
  -- Metrics
  total_collections INTEGER DEFAULT 0,
  total_payments DECIMAL(12,2) DEFAULT 0.00,
  satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_profiles_user_id (user_id),
  INDEX idx_user_profiles_coordinates (coordinates_lat, coordinates_lng),
  INDEX idx_user_profiles_district (address_district),
  INDEX idx_user_profiles_service_package (service_package_id)
);
```

**Business Rules**:
- Mỗi user chỉ có 1 profile
- Address bắt buộc phải có để định vị collection point
- Coordinates tự động generate từ address (Google Geocoding API)
- Service package define pricing và features

#### service_packages Table
```sql
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  package_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  
  -- Service limits
  collections_per_week INTEGER NOT NULL DEFAULT 3,
  urgent_requests_per_month INTEGER DEFAULT 2,
  max_weight_per_collection DECIMAL(5,2) DEFAULT 50.00, -- kg
  
  -- Features (JSON array)
  included_features JSON, -- ["regular_pickup", "urgent_support", "24h_customer_service"]
  excluded_features JSON,
  
  -- Service area restrictions
  available_districts JSON, -- ["district_1", "district_3", "district_7"]
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_service_packages_type (package_type),
  INDEX idx_service_packages_active (active),
  INDEX idx_service_packages_price (base_price)
);
```

**Package Examples**:
```json
// Gói Cơ Bản
{
  "name": "Gói Cơ Bản",
  "package_type": "monthly", 
  "base_price": 120000,
  "collections_per_week": 3,
  "urgent_requests_per_month": 1,
  "included_features": ["regular_pickup", "sms_notifications"]
}

// Gói Nâng Cao
{
  "name": "Gói Nâng Cao",
  "package_type": "monthly",
  "base_price": 180000, 
  "collections_per_week": 5,
  "urgent_requests_per_month": 3,
  "included_features": ["regular_pickup", "urgent_support", "photo_confirmation", "24h_support"]
}
```

### 2.2. Collector Management Schema

#### collectors Table
```sql
CREATE TABLE collectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Work information
  hire_date DATE NOT NULL,
  employment_status ENUM('active', 'on_leave', 'suspended', 'terminated') DEFAULT 'active',
  work_schedule JSON, -- {"days": ["monday", "tuesday", "wednesday"], "start_time": "06:00", "end_time": "14:00"}
  
  -- Assigned work zones (can work multiple zones)
  assigned_zones JSON, -- ["zone_district_1", "zone_district_3"]
  primary_zone VARCHAR(50),
  
  -- Vehicle information
  vehicle_type ENUM('truck', 'motorbike', 'bicycle', 'walking') NOT NULL DEFAULT 'motorbike',
  vehicle_plate_number VARCHAR(20),
  vehicle_capacity_kg DECIMAL(6,2),
  
  -- Performance metrics (updated nightly)
  total_collections INTEGER DEFAULT 0,
  completed_collections INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Current status
  current_status ENUM('offline', 'available', 'on_duty', 'break', 'emergency') DEFAULT 'offline',
  last_location_lat DECIMAL(10,8),
  last_location_lng DECIMAL(11,8),
  last_location_updated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_collectors_user_id (user_id),
  INDEX idx_collectors_employee_code (employee_code),
  INDEX idx_collectors_status (employment_status, current_status),
  INDEX idx_collectors_zones (primary_zone),
  INDEX idx_collectors_performance (average_rating, total_collections)
);
```

**Work Zones System**:
```json
// Zone configuration example
{
  "assigned_zones": ["district_1_north", "district_1_center"],
  "primary_zone": "district_1_north", 
  "backup_zones": ["district_3_west"], // Can work when needed
  "max_households_per_day": 50,
  "estimated_collection_time_per_household": 5 // minutes
}
```

#### work_zones Table
```sql
CREATE TABLE work_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code VARCHAR(50) UNIQUE NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  
  -- Geographic definition
  boundary_coordinates JSON NOT NULL, -- Polygon coordinates
  center_lat DECIMAL(10,8) NOT NULL,
  center_lng DECIMAL(11,8) NOT NULL,
  
  -- Administrative division
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  wards JSON, -- ["ward_1", "ward_2", "ward_3"]
  
  -- Operational information
  estimated_households INTEGER DEFAULT 0,
  active_households INTEGER DEFAULT 0, -- Currently subscribed
  collection_frequency_per_week INTEGER DEFAULT 3,
  
  -- Resource requirements
  recommended_collector_count INTEGER DEFAULT 1,
  estimated_daily_workload_hours DECIMAL(4,2) DEFAULT 6.00,
  
  -- Route optimization data
  default_start_point_lat DECIMAL(10,8), -- Depot or common starting point
  default_start_point_lng DECIMAL(11,8),
  traffic_difficulty_score INTEGER DEFAULT 5, -- 1-10 scale
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_work_zones_district (district),
  INDEX idx_work_zones_active (active),
  INDEX idx_work_zones_households (active_households)
);
```

### 2.3. Collection Scheduling Schema

#### master_schedules Table
```sql
CREATE TABLE master_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Time period this schedule covers
  effective_start_date DATE NOT NULL,
  effective_end_date DATE NOT NULL,
  
  -- Status workflow
  status ENUM('draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  
  -- Zone coverage
  covered_zones JSON NOT NULL, -- ["zone_1", "zone_2"]
  total_households_covered INTEGER DEFAULT 0,
  
  -- Resource allocation
  assigned_collectors JSON, -- [{"collector_id": "uuid", "zones": ["zone_1"], "schedule": {...}}]
  required_vehicles INTEGER DEFAULT 0,
  
  -- Approval workflow
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  -- Performance tracking
  total_scheduled_collections INTEGER DEFAULT 0,
  completed_collections INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_master_schedules_dates (effective_start_date, effective_end_date),
  INDEX idx_master_schedules_status (status),
  INDEX idx_master_schedules_created_by (created_by)
);
```

#### collection_routes Table
```sql
CREATE TABLE collection_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name VARCHAR(200) NOT NULL,
  route_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Zone assignment
  work_zone_id UUID NOT NULL REFERENCES work_zones(id),
  assigned_collector_id UUID REFERENCES collectors(id),
  
  -- Route geometry (for Leaflet map)
  route_coordinates JSON NOT NULL, -- Array of [lat, lng] points for the route path
  waypoints JSON, -- Key stops/intersections: [{"lat": 10.77, "lng": 106.69, "name": "Start Point", "type": "depot"}]
  
  -- Route optimization data
  total_distance_km DECIMAL(8,3) NOT NULL,
  estimated_travel_time_minutes INTEGER NOT NULL,
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  traffic_pattern JSON, -- {"morning": "heavy", "afternoon": "light", "evening": "medium"}
  
  -- Collection points on this route
  collection_points_count INTEGER DEFAULT 0,
  estimated_collections_per_day INTEGER DEFAULT 0,
  max_weight_capacity_kg DECIMAL(7,2) DEFAULT 500.00,
  
  -- Route schedule
  active_days JSON, -- ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  start_time TIME DEFAULT '06:00:00',
  end_time TIME DEFAULT '14:00:00',
  
  -- Status and versioning
  status ENUM('draft', 'active', 'inactive', 'under_review') DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  effective_from DATE,
  effective_until DATE,
  
  -- Admin management
  created_by UUID REFERENCES users(id),
  last_modified_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_collection_routes_zone (work_zone_id),
  INDEX idx_collection_routes_collector (assigned_collector_id),
  INDEX idx_collection_routes_status (status, effective_from),
  INDEX idx_collection_routes_code (route_code)
);
```

#### collector_location_tracking Table
```sql
CREATE TABLE collector_location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES collectors(id),
  route_id UUID REFERENCES collection_routes(id),
  
  -- Location data
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters DECIMAL(6,2), -- GPS accuracy
  altitude_meters DECIMAL(8,2),
  heading_degrees INTEGER, -- 0-360, direction of movement
  speed_kmh DECIMAL(5,2), -- Current speed
  
  -- Context information
  tracking_source ENUM('gps', 'network', 'manual') DEFAULT 'gps',
  activity_type ENUM('traveling', 'collecting', 'break', 'idle', 'unknown') DEFAULT 'unknown',
  current_collection_point_id UUID REFERENCES collection_points(id),
  
  -- Battery and device status
  device_battery_level INTEGER, -- 0-100
  device_id VARCHAR(100), -- Device identifier
  app_version VARCHAR(20),
  
  -- Automatic status detection
  is_moving BOOLEAN DEFAULT FALSE,
  stopped_duration_minutes INTEGER DEFAULT 0,
  distance_from_route_meters DECIMAL(8,2), -- How far from assigned route
  
  -- Timestamp
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  server_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance indexes
  INDEX idx_collector_tracking_collector_time (collector_id, recorded_at DESC),
  INDEX idx_collector_tracking_route_time (route_id, recorded_at DESC),
  INDEX idx_collector_tracking_location (latitude, longitude),
  INDEX idx_collector_tracking_collection_point (current_collection_point_id)
);
```

#### route_progress_tracking Table
```sql
CREATE TABLE route_progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES collectors(id),
  route_id UUID NOT NULL REFERENCES collection_routes(id),
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Route execution status
  status ENUM('not_started', 'in_progress', 'paused', 'completed', 'aborted') DEFAULT 'not_started',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  pause_duration_minutes INTEGER DEFAULT 0,
  
  -- Progress metrics
  total_collection_points INTEGER NOT NULL DEFAULT 0,
  completed_collection_points INTEGER DEFAULT 0,
  skipped_collection_points INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Distance and time tracking
  planned_distance_km DECIMAL(8,3),
  actual_distance_km DECIMAL(8,3) DEFAULT 0.00,
  planned_duration_minutes INTEGER,
  actual_duration_minutes INTEGER DEFAULT 0,
  
  -- Current position on route
  current_waypoint_index INTEGER DEFAULT 0,
  next_collection_point_id UUID REFERENCES collection_points(id),
  estimated_arrival_time TIMESTAMP,
  
  -- Deviations and issues
  route_deviations_count INTEGER DEFAULT 0,
  max_deviation_distance_meters DECIMAL(8,2) DEFAULT 0.00,
  issues_reported JSON, -- [{"time": "10:30", "type": "traffic", "description": "Heavy traffic on Main St"}]
  
  -- Performance summary
  average_speed_kmh DECIMAL(5,2),
  fuel_consumption_estimate_liters DECIMAL(6,3),
  carbon_footprint_kg DECIMAL(8,3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_route_progress_collector_date (collector_id, tracking_date),
  INDEX idx_route_progress_route_date (route_id, tracking_date),
  INDEX idx_route_progress_status (status, tracking_date),
  UNIQUE KEY unique_collector_route_date (collector_id, route_id, tracking_date)
);
```

#### collection_schedules Table
```sql
CREATE TABLE collection_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_schedule_id UUID REFERENCES master_schedules(id),
  user_id UUID NOT NULL REFERENCES users(id),
  route_id UUID REFERENCES collection_routes(id), -- Link to route
  
  -- Schedule details
  scheduled_date DATE NOT NULL,
  time_window_start TIME NOT NULL,
  time_window_end TIME NOT NULL,
  
  -- Collection information
  collection_type ENUM('regular', 'urgent', 'special', 'makeup') NOT NULL DEFAULT 'regular',
  waste_types JSON, -- ["household", "recyclable", "organic"]
  estimated_weight_kg DECIMAL(5,2),
  special_instructions TEXT,
  
  -- Assignment
  assigned_collector_id UUID REFERENCES collectors(id),
  route_sequence INTEGER, -- Order in collector's daily route
  estimated_duration_minutes INTEGER DEFAULT 10,
  waypoint_index INTEGER, -- Position on the route path
  
  -- Status tracking
  status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'scheduled',
  
  -- Location (copied from user profile for performance)
  collection_address TEXT NOT NULL,
  collection_lat DECIMAL(10,8) NOT NULL,
  collection_lng DECIMAL(11,8) NOT NULL,
  
  -- Completion tracking
  actual_start_time TIMESTAMP,
  actual_completion_time TIMESTAMP,
  actual_weight_kg DECIMAL(5,2),
  collector_notes TEXT,
  
  -- Rescheduling
  original_schedule_id UUID REFERENCES collection_schedules(id), -- If this is a rescheduled collection
  reschedule_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_collection_schedules_user_date (user_id, scheduled_date),
  INDEX idx_collection_schedules_collector_date (assigned_collector_id, scheduled_date),
  INDEX idx_collection_schedules_status_date (status, scheduled_date),
  INDEX idx_collection_schedules_master_schedule (master_schedule_id),
  INDEX idx_collection_schedules_route (assigned_collector_id, scheduled_date, route_sequence),
  INDEX idx_collection_schedules_route_waypoint (route_id, waypoint_index)
);
```

### 2.4. Real-time Collection Tracking

#### collection_points Table
```sql
CREATE TABLE collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES collection_schedules(id) ON DELETE CASCADE,
  
  -- Real-time status
  current_status ENUM('pending', 'en_route', 'arrived', 'in_progress', 'completed', 'cannot_collect', 'skipped') NOT NULL DEFAULT 'pending',
  status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Check-in tracking
  check_in_time TIMESTAMP,
  check_in_lat DECIMAL(10,8),
  check_in_lng DECIMAL(11,8),
  check_in_accuracy_meters DECIMAL(6,2),
  
  -- Collection execution
  collection_start_time TIMESTAMP,
  collection_end_time TIMESTAMP,
  actual_weight_kg DECIMAL(5,2),
  
  -- Photo documentation
  before_photo_url VARCHAR(500),
  after_photo_url VARCHAR(500),
  proof_photo_url VARCHAR(500),
  
  -- Issues and notes
  collector_notes TEXT,
  customer_notes TEXT,
  issue_reported BOOLEAN DEFAULT FALSE,
  issue_details TEXT,
  
  -- Quality metrics
  completion_time_minutes INTEGER, -- Calculated field
  customer_present BOOLEAN,
  special_handling_required BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_collection_points_schedule (schedule_id),
  INDEX idx_collection_points_status (current_status, status_updated_at),
  INDEX idx_collection_points_checkin_time (check_in_time)
);
```

#### urgent_requests Table
```sql
CREATE TABLE urgent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Request details
  requested_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  urgency_level ENUM('medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  
  -- Waste information
  waste_type VARCHAR(100) NOT NULL,
  estimated_weight_kg DECIMAL(5,2),
  waste_description TEXT,
  reason_for_urgency TEXT NOT NULL,
  special_handling_notes TEXT,
  
  -- Location (can be different from user's main address)
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,8) NOT NULL,
  pickup_lng DECIMAL(11,8) NOT NULL,
  access_instructions TEXT,
  
  -- Workflow status
  status ENUM('pending', 'reviewed', 'approved', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  
  -- Assignment
  assigned_collector_id UUID REFERENCES collectors(id),
  assigned_at TIMESTAMP,
  estimated_arrival_time TIMESTAMP,
  
  -- Completion
  completed_at TIMESTAMP,
  actual_weight_kg DECIMAL(5,2),
  additional_charges DECIMAL(8,2) DEFAULT 0.00,
  
  -- Performance metrics
  response_time_minutes INTEGER, -- Time from request to assignment
  completion_time_minutes INTEGER, -- Time from assignment to completion
  
  -- Rejection/Cancellation
  rejection_reason TEXT,
  rejected_by UUID REFERENCES users(id),
  rejected_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_urgent_requests_user_date (user_id, requested_date),
  INDEX idx_urgent_requests_status (status, created_at),
  INDEX idx_urgent_requests_assigned_collector (assigned_collector_id, assigned_at),
  INDEX idx_urgent_requests_urgency (urgency_level, status)
);
```

### 2.5. Payment Management Schema

#### user_payments Table
```sql
CREATE TABLE user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Billing information
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  service_package_id UUID REFERENCES service_packages(id),
  
  -- Amount calculation
  base_amount DECIMAL(10,2) NOT NULL,
  additional_charges DECIMAL(10,2) DEFAULT 0.00, -- Urgent requests, extra weight, etc.
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment schedule
  due_date DATE NOT NULL,
  early_payment_discount_date DATE,
  late_payment_fee DECIMAL(8,2) DEFAULT 0.00,
  
  -- Status tracking
  status ENUM('draft', 'sent', 'paid', 'partial_paid', 'overdue', 'cancelled', 'refunded') NOT NULL DEFAULT 'draft',
  
  -- Payment processing
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay') NULL,
  payment_reference VARCHAR(100), -- Transaction ID from payment gateway
  paid_at TIMESTAMP,
  
  -- Invoice details
  invoice_number VARCHAR(50) UNIQUE,
  invoice_url VARCHAR(500),
  receipt_url VARCHAR(500),
  
  -- Customer communication
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_payments_user_id (user_id),
  INDEX idx_user_payments_status (status, due_date),
  INDEX idx_user_payments_period (billing_period_start, billing_period_end),
  INDEX idx_user_payments_invoice (invoice_number)
);
```

#### payment_transactions Table
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES user_payments(id),
  
  -- Transaction details
  transaction_type ENUM('payment', 'refund', 'adjustment', 'late_fee') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  
  -- Payment processing
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay') NOT NULL,
  gateway_provider VARCHAR(50), -- 'stripe', 'vnpay', 'momo', etc.
  external_transaction_id VARCHAR(200),
  gateway_response JSON,
  
  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Error handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_payment_transactions_payment_id (payment_id),
  INDEX idx_payment_transactions_external_id (external_transaction_id),
  INDEX idx_payment_transactions_status (status, created_at)
);
```

#### collector_payroll Table
```sql
CREATE TABLE collector_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES collectors(id),
  
  -- Payroll period
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_period_type ENUM('weekly', 'biweekly', 'monthly') NOT NULL DEFAULT 'monthly',
  
  -- Work metrics
  total_work_days INTEGER NOT NULL DEFAULT 0,
  total_work_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_collections INTEGER NOT NULL DEFAULT 0,
  total_weight_collected_kg DECIMAL(8,2) DEFAULT 0.00,
  
  -- Performance metrics
  on_time_collections INTEGER DEFAULT 0,
  late_collections INTEGER DEFAULT 0,
  missed_collections INTEGER DEFAULT 0,
  customer_rating_average DECIMAL(3,2) DEFAULT 0.00,
  customer_complaints INTEGER DEFAULT 0,
  
  -- Salary calculation
  base_salary DECIMAL(10,2) NOT NULL,
  performance_bonus DECIMAL(8,2) DEFAULT 0.00,
  overtime_hours DECIMAL(5,2) DEFAULT 0.00,
  overtime_rate_per_hour DECIMAL(8,2) DEFAULT 0.00,
  overtime_pay DECIMAL(8,2) DEFAULT 0.00,
  
  -- Deductions
  late_penalty DECIMAL(6,2) DEFAULT 0.00,
  absence_penalty DECIMAL(6,2) DEFAULT 0.00,
  damage_deduction DECIMAL(8,2) DEFAULT 0.00,
  other_deductions DECIMAL(8,2) DEFAULT 0.00,
  
  -- Total calculation
  gross_pay DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(8,2) DEFAULT 0.00,
  net_pay DECIMAL(10,2) NOT NULL,
  
  -- Approval workflow
  status ENUM('draft', 'pending_approval', 'approved', 'paid', 'disputed', 'cancelled') NOT NULL DEFAULT 'draft',
  prepared_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  -- Supporting documents
  timesheet_data JSON,
  performance_data JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_collector_payroll_collector (collector_id),
  INDEX idx_collector_payroll_period (pay_period_start, pay_period_end),
  INDEX idx_collector_payroll_status (status, created_at)
);
```

## 3. Business Logic & Rules

### 3.1. Route Management & Optimization

**Route Creation by Admin**:
```sql
-- Admin creates new collection route using Leaflet map interface
INSERT INTO collection_routes (
  route_name,
  route_code,
  work_zone_id,
  route_coordinates,
  waypoints,
  total_distance_km,
  estimated_travel_time_minutes,
  collection_points_count,
  active_days,
  created_by
) VALUES (
  'Route D1-North-01',
  'D1N01',
  zone_id,
  '[
    [10.7769, 106.6959],
    [10.7775, 106.6965],
    [10.7780, 106.6970],
    [10.7785, 106.6975]
  ]', -- GPS coordinates from Leaflet map drawing
  '[
    {"lat": 10.7769, "lng": 106.6959, "name": "Depot Start", "type": "depot"},
    {"lat": 10.7775, "lng": 106.6965, "name": "Main St Junction", "type": "waypoint"},
    {"lat": 10.7780, "lng": 106.6970, "name": "School Area", "type": "collection_zone"},
    {"lat": 10.7785, "lng": 106.6975, "name": "Residential Complex", "type": "collection_zone"}
  ]',
  5.2, -- Total distance calculated by Leaflet
  120, -- Estimated time
  25,  -- Collection points on this route
  '["monday", "wednesday", "friday"]',
  admin_user_id
);

-- Link existing collection points to route waypoints
UPDATE collection_schedules 
SET 
  route_id = route_id,
  waypoint_index = calculate_nearest_waypoint(collection_lat, collection_lng, route_coordinates)
WHERE assigned_collector_id = collector_id 
  AND scheduled_date >= CURRENT_DATE;
```

**Collector Location Tracking Functions**:
```sql
-- Function: Record collector location (called every 30 seconds from mobile app)
CREATE OR REPLACE FUNCTION record_collector_location(
  p_collector_id UUID,
  p_latitude DECIMAL(10,8),
  p_longitude DECIMAL(11,8),
  p_accuracy_meters DECIMAL(6,2),
  p_speed_kmh DECIMAL(5,2) DEFAULT 0,
  p_heading_degrees INTEGER DEFAULT NULL,
  p_battery_level INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  tracking_record_id UUID;
  current_route_id UUID;
  nearest_collection_point_id UUID;
  distance_from_route DECIMAL(8,2);
  activity_detected VARCHAR(20);
BEGIN
  -- Get collector's current route
  SELECT rpt.route_id INTO current_route_id
  FROM route_progress_tracking rpt
  WHERE rpt.collector_id = p_collector_id 
    AND rpt.tracking_date = CURRENT_DATE
    AND rpt.status = 'in_progress';
  
  -- Determine activity type based on speed and context
  IF p_speed_kmh > 5 THEN
    activity_detected := 'traveling';
  ELSIF p_speed_kmh <= 1 THEN
    activity_detected := 'collecting';
  ELSE
    activity_detected := 'unknown';
  END IF;
  
  -- Find nearest collection point
  SELECT cs.id INTO nearest_collection_point_id
  FROM collection_schedules cs
  WHERE cs.assigned_collector_id = p_collector_id
    AND cs.scheduled_date = CURRENT_DATE
    AND cs.status IN ('confirmed', 'in_progress')
  ORDER BY ST_Distance(
    ST_GeogFromText('POINT(' || p_longitude || ' ' || p_latitude || ')'),
    ST_GeogFromText('POINT(' || cs.collection_lng || ' ' || cs.collection_lat || ')')
  )
  LIMIT 1;
  
  -- Calculate distance from assigned route
  IF current_route_id IS NOT NULL THEN
    SELECT calculate_distance_from_route(current_route_id, p_latitude, p_longitude) 
    INTO distance_from_route;
  END IF;
  
  -- Insert tracking record
  INSERT INTO collector_location_tracking (
    collector_id,
    route_id,
    latitude,
    longitude,
    accuracy_meters,
    speed_kmh,
    heading_degrees,
    activity_type,
    current_collection_point_id,
    device_battery_level,
    is_moving,
    distance_from_route_meters,
    recorded_at
  ) VALUES (
    p_collector_id,
    current_route_id,
    p_latitude,
    p_longitude,
    p_accuracy_meters,
    p_speed_kmh,
    p_heading_degrees,
    activity_detected,
    nearest_collection_point_id,
    p_battery_level,
    (p_speed_kmh > 1),
    distance_from_route,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO tracking_record_id;
  
  -- Update route progress if collector is moving along route
  IF current_route_id IS NOT NULL AND distance_from_route < 100 THEN
    PERFORM update_route_progress(p_collector_id, current_route_id, p_latitude, p_longitude);
  END IF;
  
  RETURN tracking_record_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate distance from assigned route
CREATE OR REPLACE FUNCTION calculate_distance_from_route(
  p_route_id UUID,
  p_lat DECIMAL(10,8),
  p_lng DECIMAL(11,8)
) RETURNS DECIMAL(8,2) AS $$
DECLARE
  route_coords JSON;
  min_distance DECIMAL(8,2) := 999999;
  coord_point JSON;
  point_distance DECIMAL(8,2);
BEGIN
  -- Get route coordinates
  SELECT route_coordinates INTO route_coords
  FROM collection_routes
  WHERE id = p_route_id;
  
  -- Calculate minimum distance to any point on the route
  FOR coord_point IN SELECT * FROM json_array_elements(route_coords) LOOP
    SELECT ST_Distance(
      ST_GeogFromText('POINT(' || p_lng || ' ' || p_lat || ')'),
      ST_GeogFromText('POINT(' || (coord_point->>1) || ' ' || (coord_point->>0) || ')')
    ) INTO point_distance;
    
    IF point_distance < min_distance THEN
      min_distance := point_distance;
    END IF;
  END LOOP;
  
  RETURN min_distance;
END;
$$ LANGUAGE plpgsql;

-- Function: Update route progress based on current location
CREATE OR REPLACE FUNCTION update_route_progress(
  p_collector_id UUID,
  p_route_id UUID,
  p_current_lat DECIMAL(10,8),
  p_current_lng DECIMAL(11,8)
) RETURNS VOID AS $$
DECLARE
  progress_record RECORD;
  completed_points INTEGER;
  total_points INTEGER;
  new_completion_percentage DECIMAL(5,2);
BEGIN
  -- Get current route progress
  SELECT * INTO progress_record
  FROM route_progress_tracking
  WHERE collector_id = p_collector_id 
    AND route_id = p_route_id 
    AND tracking_date = CURRENT_DATE;
  
  -- Count completed collection points
  SELECT 
    COUNT(CASE WHEN cp.current_status = 'completed' THEN 1 END),
    COUNT(*)
  INTO completed_points, total_points
  FROM collection_schedules cs
  JOIN collection_points cp ON cs.id = cp.schedule_id
  WHERE cs.assigned_collector_id = p_collector_id
    AND cs.route_id = p_route_id
    AND cs.scheduled_date = CURRENT_DATE;
  
  -- Calculate completion percentage
  IF total_points > 0 THEN
    new_completion_percentage := (completed_points::decimal / total_points) * 100;
  ELSE
    new_completion_percentage := 0;
  END IF;
  
  -- Update progress tracking
  UPDATE route_progress_tracking
  SET 
    completed_collection_points = completed_points,
    total_collection_points = total_points,
    completion_percentage = new_completion_percentage,
    updated_at = CURRENT_TIMESTAMP
  WHERE collector_id = p_collector_id 
    AND route_id = p_route_id 
    AND tracking_date = CURRENT_DATE;
    
  -- If route is completed, mark as completed
  IF new_completion_percentage >= 100 THEN
    UPDATE route_progress_tracking
    SET 
      status = 'completed',
      end_time = CURRENT_TIMESTAMP,
      actual_duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))/60
    WHERE collector_id = p_collector_id 
      AND route_id = p_route_id 
      AND tracking_date = CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Real-time Route Monitoring**:
```sql
-- Get collector's current position and route progress (for admin dashboard)
SELECT 
  c.id as collector_id,
  up.full_name as collector_name,
  cr.route_name,
  rpt.completion_percentage,
  rpt.status as route_status,
  clt.latitude as current_lat,
  clt.longitude as current_lng,
  clt.speed_kmh,
  clt.activity_type,
  clt.distance_from_route_meters,
  clt.device_battery_level,
  clt.recorded_at as last_update,
  
  -- Next collection point info
  cs.collection_address as next_collection_address,
  cs.time_window_start as next_scheduled_time,
  cp.current_status as next_point_status
  
FROM collectors c
JOIN users u ON c.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN route_progress_tracking rpt ON c.id = rpt.collector_id AND rpt.tracking_date = CURRENT_DATE
LEFT JOIN collection_routes cr ON rpt.route_id = cr.id
LEFT JOIN LATERAL (
  SELECT * FROM collector_location_tracking 
  WHERE collector_id = c.id 
  ORDER BY recorded_at DESC 
  LIMIT 1
) clt ON TRUE
LEFT JOIN collection_schedules cs ON cs.id = rpt.next_collection_point_id
LEFT JOIN collection_points cp ON cs.id = cp.schedule_id
WHERE c.employment_status = 'active' 
  AND c.current_status IN ('available', 'on_duty')
ORDER BY c.id;
```

### 3.2. Leaflet Map Integration Data

**Route Visualization Data for Leaflet**:
```sql
-- Get route data for displaying on Leaflet map (admin route management)
SELECT 
  cr.id,
  cr.route_name,
  cr.route_code,
  cr.route_coordinates, -- Array of [lat, lng] for drawing polyline
  cr.waypoints, -- Points of interest along the route
  cr.total_distance_km,
  cr.estimated_travel_time_minutes,
  cr.status,
  
  -- Collection points along this route
  json_agg(
    json_build_object(
      'id', cs.id,
      'address', cs.collection_address,
      'lat', cs.collection_lat,
      'lng', cs.collection_lng,
      'time_window', cs.time_window_start || ' - ' || cs.time_window_end,
      'route_sequence', cs.route_sequence,
      'waypoint_index', cs.waypoint_index,
      'status', COALESCE(cp.current_status, 'pending')
    ) ORDER BY cs.route_sequence
  ) as collection_points
  
FROM collection_routes cr
LEFT JOIN collection_schedules cs ON cr.id = cs.route_id AND cs.scheduled_date = CURRENT_DATE
LEFT JOIN collection_points cp ON cs.id = cp.schedule_id
WHERE cr.status = 'active'
GROUP BY cr.id, cr.route_name, cr.route_code, cr.route_coordinates, cr.waypoints, 
         cr.total_distance_km, cr.estimated_travel_time_minutes, cr.status;
```

**Real-time Collector Tracking for Map**:
```sql
-- Get collector locations for live tracking on map (update every 30 seconds)
SELECT 
  c.id as collector_id,
  c.employee_code,
  up.full_name,
  c.current_status,
  
  -- Current location
  clt.latitude,
  clt.longitude,
  clt.accuracy_meters,
  clt.speed_kmh,
  clt.heading_degrees,
  clt.activity_type,
  clt.device_battery_level,
  clt.recorded_at,
  
  -- Route information
  cr.route_name,
  cr.route_coordinates, -- For showing route path
  clt.distance_from_route_meters,
  
  -- Progress information
  rpt.completion_percentage,
  rpt.completed_collection_points,
  rpt.total_collection_points,
  
  -- Next collection point
  cs.collection_address as next_address,
  cs.collection_lat as next_lat,
  cs.collection_lng as next_lng,
  cs.time_window_start as next_time_window
  
FROM collectors c
JOIN users u ON c.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id

-- Get latest location
LEFT JOIN LATERAL (
  SELECT * FROM collector_location_tracking 
  WHERE collector_id = c.id 
  ORDER BY recorded_at DESC 
  LIMIT 1
) clt ON TRUE

-- Get current route progress
LEFT JOIN route_progress_tracking rpt ON c.id = rpt.collector_id 
  AND rpt.tracking_date = CURRENT_DATE 
  AND rpt.status = 'in_progress'

LEFT JOIN collection_routes cr ON rpt.route_id = cr.id

-- Get next collection point
LEFT JOIN collection_schedules cs ON cs.id = rpt.next_collection_point_id

WHERE c.employment_status = 'active'
  AND clt.recorded_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes' -- Only show recent locations
ORDER BY c.employee_code;
```

### 3.3. User Registration & Service Activation

**Registration Workflow**:
```sql
-- Step 1: Create user account (pending status)
INSERT INTO users (email, phone, password_hash, role, status)
VALUES ('user@example.com', '+84901234567', 'hashed_password', 'user', 'pending');

-- Step 2: Create user profile
INSERT INTO user_profiles (user_id, full_name, address_street, address_ward, address_district, address_city, registration_date)
VALUES (user_id, 'John Doe', '123 Main St', 'Ward 1', 'District 1', 'Ho Chi Minh City', CURRENT_DATE);

-- Step 3: Send verification SMS/Email
INSERT INTO verification_tokens (user_id, token_type, token, expires_at)
VALUES (user_id, 'phone_verification', 'random_6_digit_code', NOW() + INTERVAL 10 MINUTE);

-- Step 4: After verification - activate account and assign service package
UPDATE users SET status = 'active', phone_verified = TRUE WHERE id = user_id;
UPDATE user_profiles SET service_package_id = package_id, service_start_date = CURRENT_DATE WHERE user_id = user_id;
```

**Business Rules**:
1. Mỗi phone/email chỉ có thể đăng ký 1 lần
2. Address phải nằm trong service coverage area
3. Service chỉ activate sau khi verify phone + first payment
4. Automatic schedule generation sau khi activate

### 3.4. Collection Scheduling Logic

**Master Schedule Creation**:
```sql
-- Create master schedule cho 1 tháng
INSERT INTO master_schedules (
  schedule_name, 
  effective_start_date, 
  effective_end_date, 
  covered_zones, 
  created_by
) VALUES (
  'June 2024 Collection Schedule',
  '2024-06-01',
  '2024-06-30', 
  '["district_1", "district_3", "district_7"]',
  admin_user_id
);

-- Generate individual collection schedules for all active users
INSERT INTO collection_schedules (
  master_schedule_id,
  user_id,
  scheduled_date,
  time_window_start,
  time_window_end,
  collection_type,
  collection_address,
  collection_lat,
  collection_lng
)
SELECT 
  master_schedule_id,
  up.user_id,
  generate_collection_date(up.service_start_date, sp.collections_per_week),
  '09:00',
  '11:00',
  'regular',
  CONCAT(up.address_street, ', ', up.address_ward, ', ', up.address_district, ', ', up.address_city),
  up.coordinates_lat,
  up.coordinates_lng
FROM user_profiles up
JOIN service_packages sp ON up.service_package_id = sp.id  
JOIN users u ON up.user_id = u.id
WHERE u.status = 'active' 
  AND up.address_district IN ('District 1', 'District 3', 'District 7');
```

**Route Optimization Algorithm**:
```sql
-- Assign collectors to schedules with route optimization
WITH collector_capacity AS (
  SELECT 
    c.id as collector_id,
    c.primary_zone,
    50 as max_collections_per_day -- Business rule
  FROM collectors c 
  WHERE c.employment_status = 'active'
),
daily_collections AS (
  SELECT 
    scheduled_date,
    COUNT(*) as total_collections,
    array_agg(
      json_build_object(
        'schedule_id', id,
        'lat', collection_lat,
        'lng', collection_lng,
        'address', collection_address
      ) ORDER BY collection_lat, collection_lng -- Simple geographic clustering
    ) as collection_points
  FROM collection_schedules 
  WHERE status = 'scheduled'
    AND assigned_collector_id IS NULL
  GROUP BY scheduled_date
)
-- Assign collectors using traveling salesman approximation
UPDATE collection_schedules 
SET 
  assigned_collector_id = optimal_collector_id,
  route_sequence = optimal_sequence,
  estimated_duration_minutes = 10
WHERE id = schedule_id;
```

### 3.5. Real-time Collection Tracking

**Collector Check-in Process**:
```sql
-- When collector arrives at collection point
UPDATE collection_points 
SET 
  current_status = 'arrived',
  check_in_time = CURRENT_TIMESTAMP,
  check_in_lat = collector_current_lat,
  check_in_lng = collector_current_lng,
  status_updated_at = CURRENT_TIMESTAMP
WHERE schedule_id = schedule_id;

-- Validate location (business rule: within 50 meters of collection address)
SELECT 
  ST_DWithin(
    ST_GeogFromText('POINT(' || check_in_lng || ' ' || check_in_lat || ')'),
    ST_GeogFromText('POINT(' || cs.collection_lng || ' ' || cs.collection_lat || ')'),
    50 -- meters
  ) as location_valid
FROM collection_points cp
JOIN collection_schedules cs ON cp.schedule_id = cs.id
WHERE cp.id = collection_point_id;
```

**Collection Completion Workflow**:
```sql
-- Complete collection
UPDATE collection_points 
SET 
  current_status = 'completed',
  collection_end_time = CURRENT_TIMESTAMP,
  actual_weight_kg = actual_weight,
  proof_photo_url = photo_url,
  collector_notes = notes,
  completion_time_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - collection_start_time))/60
WHERE schedule_id = schedule_id;

-- Update parent schedule
UPDATE collection_schedules 
SET 
  status = 'completed',
  actual_completion_time = CURRENT_TIMESTAMP,
  actual_weight_kg = actual_weight,
  collector_notes = notes
WHERE id = schedule_id;

-- Trigger user notification
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  user_id,
  'collection_completed',
  'Collection Completed',
  'Your waste has been collected successfully',
  json_build_object('schedule_id', schedule_id, 'collector_id', collector_id)
);
```

### 3.6. Payment Processing Logic

**Monthly Billing Generation**:
```sql
-- Generate monthly bills for all active users
INSERT INTO user_payments (
  user_id,
  billing_period_start,
  billing_period_end,
  service_package_id,
  base_amount,
  additional_charges,
  total_amount,
  due_date,
  invoice_number,
  status
)
SELECT 
  up.user_id,
  DATE_TRUNC('month', CURRENT_DATE) as period_start,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as period_end,
  up.service_package_id,
  sp.base_price,
  COALESCE(urgent_charges.total_charges, 0),
  sp.base_price + COALESCE(urgent_charges.total_charges, 0),
  CURRENT_DATE + INTERVAL '15 days', -- 15 days to pay
  generate_invoice_number(),
  'sent'
FROM user_profiles up
JOIN service_packages sp ON up.service_package_id = sp.id
JOIN users u ON up.user_id = u.id
LEFT JOIN (
  -- Calculate additional charges from urgent requests
  SELECT 
    user_id,
    SUM(additional_charges) as total_charges
  FROM urgent_requests 
  WHERE DATE_TRUNC('month', requested_date) = DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed'
  GROUP BY user_id
) urgent_charges ON up.user_id = urgent_charges.user_id
WHERE u.status = 'active';
```

**Payment Processing**:
```sql
-- Process payment via payment gateway
INSERT INTO payment_transactions (
  payment_id,
  transaction_type,
  amount,
  payment_method,
  gateway_provider,
  external_transaction_id,
  status
) VALUES (
  payment_id,
  'payment',
  payment_amount,
  'vnpay',
  'vnpay',
  gateway_transaction_id,
  'processing'
);

-- After successful payment confirmation
UPDATE user_payments 
SET 
  status = 'paid',
  paid_amount = payment_amount,
  payment_method = 'vnpay',
  payment_reference = gateway_transaction_id,
  paid_at = CURRENT_TIMESTAMP
WHERE id = payment_id;

UPDATE payment_transactions 
SET 
  status = 'completed',
  completed_at = CURRENT_TIMESTAMP
WHERE payment_id = payment_id;
```

### 3.7. Performance Analytics

**Collector Performance Calculation**:
```sql
-- Update collector performance metrics (run nightly)
WITH collector_stats AS (
  SELECT 
    cs.assigned_collector_id as collector_id,
    COUNT(*) as total_assigned,
    COUNT(CASE WHEN cs.status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN cs.actual_completion_time <= (cs.scheduled_date + cs.time_window_end::time) THEN 1 END) as on_time,
    AVG(cf.stars) as avg_rating,
    COUNT(cf.id) as total_reviews
  FROM collection_schedules cs
  LEFT JOIN collection_feedback cf ON cs.id = cf.schedule_id
  WHERE cs.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
    AND cs.assigned_collector_id IS NOT NULL
  GROUP BY cs.assigned_collector_id
)
UPDATE collectors 
SET 
  total_collections = cs.total_assigned,
  completed_collections = cs.completed,
  average_rating = COALESCE(cs.avg_rating, 0),
  total_reviews = cs.total_reviews,
  on_time_percentage = (cs.on_time::decimal / NULLIF(cs.completed, 0)) * 100
FROM collector_stats cs
WHERE collectors.id = cs.collector_id;
```

**System Analytics Dashboard**:
```sql
-- Daily system metrics
SELECT 
  CURRENT_DATE as metric_date,
  (SELECT COUNT(*) FROM users WHERE status = 'active' AND role = 'user') as active_users,
  (SELECT COUNT(*) FROM collectors WHERE employment_status = 'active') as active_collectors,
  (SELECT COUNT(*) FROM collection_schedules WHERE scheduled_date = CURRENT_DATE) as scheduled_collections,
  (SELECT COUNT(*) FROM collection_schedules WHERE scheduled_date = CURRENT_DATE AND status = 'completed') as completed_collections,
  (SELECT SUM(total_amount) FROM user_payments WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'paid') as monthly_revenue,
  (SELECT AVG(stars) FROM collection_feedback WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as avg_customer_satisfaction;
```

## 4. Database Triggers & Stored Procedures

### 4.1. Route & Location Triggers

```sql
-- Trigger: Automatically start route progress tracking when collector begins route
CREATE OR REPLACE FUNCTION start_route_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- When a collection_points status changes to 'en_route' for the first time today
  IF NEW.current_status = 'en_route' AND OLD.current_status = 'pending' THEN
    
    -- Check if route progress tracking exists
    INSERT INTO route_progress_tracking (
      collector_id,
      route_id,
      tracking_date,
      status,
      start_time,
      total_collection_points
    )
    SELECT 
      cs.assigned_collector_id,
      cs.route_id,
      CURRENT_DATE,
      'in_progress',
      CURRENT_TIMESTAMP,
      COUNT(*) OVER (PARTITION BY cs.assigned_collector_id, cs.route_id)
    FROM collection_schedules cs
    WHERE cs.id = NEW.schedule_id
    ON CONFLICT (collector_id, route_id, tracking_date) 
    DO UPDATE SET 
      status = 'in_progress',
      start_time = COALESCE(route_progress_tracking.start_time, CURRENT_TIMESTAMP);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_start_route_progress
  AFTER UPDATE ON collection_points
  FOR EACH ROW
  WHEN (NEW.current_status = 'en_route' AND OLD.current_status != 'en_route')
  EXECUTE FUNCTION start_route_progress();

-- Trigger: Update collector's last known location
CREATE OR REPLACE FUNCTION update_collector_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Update collector's current location in collectors table
  UPDATE collectors 
  SET 
    last_location_lat = NEW.latitude,
    last_location_lng = NEW.longitude,
    last_location_updated_at = NEW.recorded_at,
    current_status = CASE 
      WHEN NEW.activity_type = 'collecting' THEN 'on_duty'
      WHEN NEW.activity_type = 'traveling' AND NEW.speed_kmh > 5 THEN 'on_duty'
      WHEN NEW.activity_type = 'idle' THEN 'available'
      ELSE current_status
    END
  WHERE id = NEW.collector_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collector_location
  AFTER INSERT ON collector_location_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_collector_location();

-- Trigger: Detect route completion automatically
CREATE OR REPLACE FUNCTION check_route_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_points INTEGER;
  completed_points INTEGER;
  route_id_var UUID;
BEGIN
  -- Get route information
  SELECT cs.route_id INTO route_id_var
  FROM collection_schedules cs 
  WHERE cs.id = NEW.schedule_id;
  
  -- Count total and completed points for this route today
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN cp.current_status = 'completed' THEN 1 END)
  INTO total_points, completed_points
  FROM collection_schedules cs
  JOIN collection_points cp ON cs.id = cp.schedule_id
  WHERE cs.route_id = route_id_var
    AND cs.scheduled_date = CURRENT_DATE
    AND cs.assigned_collector_id = (
      SELECT assigned_collector_id 
      FROM collection_schedules 
      WHERE id = NEW.schedule_id
    );
  
  -- If all points completed, mark route as completed
  IF completed_points = total_points AND total_points > 0 THEN
    UPDATE route_progress_tracking
    SET 
      status = 'completed',
      end_time = CURRENT_TIMESTAMP,
      completion_percentage = 100.00,
      completed_collection_points = completed_points
    WHERE route_id = route_id_var
      AND tracking_date = CURRENT_DATE
      AND status = 'in_progress';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_route_completion
  AFTER UPDATE ON collection_points
  FOR EACH ROW
  WHEN (NEW.current_status = 'completed' AND OLD.current_status != 'completed')
  EXECUTE FUNCTION check_route_completion();
```

### 4.2. Automatic Data Updates

```sql
-- Trigger: Update user profile when address changes
CREATE OR REPLACE FUNCTION update_user_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger geocoding API call when address changes
  IF (NEW.address_street != OLD.address_street OR 
      NEW.address_ward != OLD.address_ward OR 
      NEW.address_district != OLD.address_district) THEN
    
    -- This would call external geocoding service
    -- For now, mark as needing update
    NEW.coordinates_lat = NULL;
    NEW.coordinates_lng = NULL;
    NEW.address_verified = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coordinates
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_coordinates();
```

### 4.3. Data Validation

```sql
-- Function: Validate service package eligibility
CREATE OR REPLACE FUNCTION validate_service_package(
  user_district VARCHAR(100),
  package_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  package_districts JSON;
BEGIN
  SELECT available_districts INTO package_districts 
  FROM service_packages 
  WHERE id = package_id AND active = TRUE;
  
  -- Check if user's district is in package coverage
  RETURN package_districts ? user_district;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate route distance
CREATE OR REPLACE FUNCTION calculate_route_distance(
  start_lat DECIMAL,
  start_lng DECIMAL,
  end_lat DECIMAL,
  end_lng DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- Haversine formula for distance calculation
  RETURN ST_Distance(
    ST_GeogFromText('POINT(' || start_lng || ' ' || start_lat || ')'),
    ST_GeogFromText('POINT(' || end_lng || ' ' || end_lat || ')')
  ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;
```

## 5. Data Migration & Seeding

### 5.1. Initial Data Setup

```sql
-- Service packages setup
INSERT INTO service_packages (name, package_type, base_price, collections_per_week, urgent_requests_per_month, included_features, available_districts) VALUES
('Gói Cơ Bản', 'monthly', 120000, 3, 1, '["regular_pickup", "sms_notifications"]', '["District 1", "District 3", "District 7"]'),
('Gói Tiêu Chuẩn', 'monthly', 180000, 4, 2, '["regular_pickup", "sms_notifications", "email_notifications", "urgent_support"]', '["District 1", "District 3", "District 7", "District 10"]'),
('Gói Nâng Cao', 'monthly', 250000, 5, 3, '["regular_pickup", "urgent_support", "photo_confirmation", "24h_support", "priority_scheduling"]', '["District 1", "District 3", "District 7", "District 10", "Thu Duc"]');

-- Work zones setup
INSERT INTO work_zones (zone_code, zone_name, city, district, estimated_households, center_lat, center_lng) VALUES
('D1_NORTH', 'District 1 North', 'Ho Chi Minh City', 'District 1', 500, 10.7769, 106.6959),
('D1_SOUTH', 'District 1 South', 'Ho Chi Minh City', 'District 1', 450, 10.7691, 106.7016),
('D3_WEST', 'District 3 West', 'Ho Chi Minh City', 'District 3', 600, 10.7861, 106.6831),
('D7_CENTER', 'District 7 Center', 'Ho Chi Minh City', 'District 7', 800, 10.7308, 106.7244);

-- Sample collection routes for Leaflet map
INSERT INTO collection_routes (route_name, route_code, work_zone_id, route_coordinates, waypoints, total_distance_km, estimated_travel_time_minutes, active_days, status, created_by) VALUES
(
  'Route District 1 North - Morning',
  'D1N_M01',
  (SELECT id FROM work_zones WHERE zone_code = 'D1_NORTH'),
  '[
    [10.7769, 106.6959],
    [10.7775, 106.6965],
    [10.7780, 106.6970],
    [10.7785, 106.6975],
    [10.7790, 106.6980],
    [10.7795, 106.6985]
  ]',
  '[
    {"lat": 10.7769, "lng": 106.6959, "name": "Depot Start", "type": "depot", "description": "Starting point - waste management depot"},
    {"lat": 10.7775, "lng": 106.6965, "name": "Ben Thanh Area", "type": "collection_zone", "description": "High density residential area"},
    {"lat": 10.7780, "lng": 106.6970, "name": "Nguyen Hue Walking Street", "type": "waypoint", "description": "Commercial area - special handling"},
    {"lat": 10.7785, "lng": 106.6975, "name": "Dong Khoi District", "type": "collection_zone", "description": "Mixed residential/commercial"},
    {"lat": 10.7790, 106.6980, "name": "Saigon River View", "type": "collection_zone", "description": "Apartment complexes"},
    {"lat": 10.7795, 106.6985, "name": "Return Depot", "type": "depot", "description": "End point - return to depot"}
  ]',
  6.8,
  150,
  '["monday", "wednesday", "friday"]',
  'active',
  (SELECT id FROM users WHERE email = 'admin@example.com')
),
(
  'Route District 3 West - Full Coverage',
  'D3W_FC01', 
  (SELECT id FROM work_zones WHERE zone_code = 'D3_WEST'),
  '[
    [10.7861, 106.6831],
    [10.7855, 106.6825],
    [10.7850, 106.6820],
    [10.7845, 106.6815],
    [10.7840, 106.6810],
    [10.7835, 106.6805],
    [10.7861, 106.6831]
  ]',
  '[
    {"lat": 10.7861, "lng": 106.6831, "name": "District 3 Depot", "type": "depot"},
    {"lat": 10.7855, "lng": 106.6825, "name": "Tao Dan Park Area", "type": "collection_zone"},
    {"lat": 10.7850, "lng": 106.6820, "name": "Vo Van Tan Street", "type": "collection_zone"},
    {"lat": 10.7845, "lng": 106.6815, "name": "Hospital Area", "type": "special_zone", "description": "Medical waste handling required"},
    {"lat": 10.7840, "lng": 106.6810, "name": "School District", "type": "collection_zone"},
    {"lat": 10.7835, "lng": 106.6805, "name": "Residential Complex", "type": "collection_zone"}
  ]',
  8.2,
  180,
  '["tuesday", "thursday", "saturday"]',
  'active',
  (SELECT id FROM users WHERE email = 'admin@example.com')
);
```

---

## 6. Leaflet Map Integration Examples

### 6.1. Route Visualization Components

**Frontend JavaScript for Route Display**:
```javascript
// Display collection route on Leaflet map
function displayCollectionRoute(routeData) {
  // Parse route coordinates
  const routeCoordinates = JSON.parse(routeData.route_coordinates);
  const waypoints = JSON.parse(routeData.waypoints);
  
  // Create route polyline
  const routeLine = L.polyline(routeCoordinates, {
    color: '#16A34A',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 10'
  }).addTo(map);
  
  // Add waypoints as markers
  waypoints.forEach(waypoint => {
    const icon = getWaypointIcon(waypoint.type);
    L.marker([waypoint.lat, waypoint.lng], { icon })
      .bindPopup(`
        <h3>${waypoint.name}</h3>
        <p><strong>Type:</strong> ${waypoint.type}</p>
        <p>${waypoint.description || ''}</p>
      `)
      .addTo(map);
  });
  
  // Add collection points along route
  routeData.collection_points.forEach(point => {
    const status = point.status || 'pending';
    const statusColor = getStatusColor(status);
    
    L.circleMarker([point.lat, point.lng], {
      radius: 6,
      fillColor: statusColor,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`
      <div>
        <h4>Collection Point</h4>
        <p><strong>Address:</strong> ${point.address}</p>
        <p><strong>Time:</strong> ${point.time_window}</p>
        <p><strong>Sequence:</strong> #${point.route_sequence}</p>
        <p><strong>Status:</strong> <span class="status-${status}">${status}</span></p>
      </div>
    `).addTo(map);
  });
  
  // Fit map to route bounds
  map.fitBounds(routeLine.getBounds());
}

// Real-time collector tracking
function trackCollectorLocation(collectorData) {
  if (collectorMarkers[collectorData.collector_id]) {
    // Update existing marker
    const marker = collectorMarkers[collectorData.collector_id];
    marker.setLatLng([collectorData.latitude, collectorData.longitude]);
    marker.setRotationAngle(collectorData.heading_degrees || 0);
  } else {
    // Create new collector marker
    const collectorIcon = L.divIcon({
      className: 'collector-marker',
      html: `
        <div class="collector-icon" style="transform: rotate(${collectorData.heading_degrees || 0}deg);">
          <i class="fas fa-truck"></i>
          <div class="collector-info">
            <div class="collector-name">${collectorData.full_name}</div>
            <div class="collector-status">${collectorData.activity_type}</div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    
    collectorMarkers[collectorData.collector_id] = L.marker(
      [collectorData.latitude, collectorData.longitude], 
      { icon: collectorIcon }
    ).addTo(map);
  }
  
  // Update collector info panel
  updateCollectorInfo(collectorData);
}

function getStatusColor(status) {
  const colors = {
    'pending': '#fbbf24',      // amber
    'en_route': '#3b82f6',     // blue  
    'arrived': '#8b5cf6',      // purple
    'in_progress': '#f59e0b',  // orange
    'completed': '#10b981',    // emerald
    'cannot_collect': '#ef4444', // red
    'skipped': '#6b7280'       // gray
  };
  return colors[status] || '#6b7280';
}
```

**Real-time Updates with WebSocket**:
```javascript
// WebSocket connection for real-time updates
const wsConnection = new WebSocket('ws://localhost:3001/tracking');

wsConnection.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'collector_location_update':
      trackCollectorLocation(data.payload);
      break;
      
    case 'collection_status_update':
      updateCollectionPointStatus(data.payload);
      break;
      
    case 'route_progress_update':
      updateRouteProgress(data.payload);
      break;
  }
};

// Send location update from collector mobile app
function sendLocationUpdate(position) {
  const locationData = {
    type: 'location_update',
    collector_id: currentCollectorId,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speed: position.coords.speed || 0,
    heading: position.coords.heading,
    timestamp: new Date().toISOString()
  };
  
  wsConnection.send(JSON.stringify(locationData));
}
```

### 6.2. Admin Route Management Interface

**Route Creation with Leaflet Drawing Tools**:
```javascript
// Admin interface for creating new routes
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: false,
    circle: false,
    rectangle: false,
    marker: true,
    polyline: {
      shapeOptions: {
        color: '#16A34A',
        weight: 4
      }
    }
  }
});
map.addControl(drawControl);

// Handle route creation
map.on('draw:created', function(e) {
  const layer = e.layer;
  const type = e.layerType;
  
  if (type === 'polyline') {
    // Route path created
    const coordinates = layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]);
    currentRoute.coordinates = coordinates;
    currentRoute.distance = calculateRouteDistance(coordinates);
    
    drawnItems.addLayer(layer);
    
    // Show route creation form
    showRouteCreationForm(currentRoute);
    
  } else if (type === 'marker') {
    // Waypoint created
    const latlng = layer.getLatLng();
    const waypoint = {
      lat: latlng.lat,
      lng: latlng.lng,
      name: prompt('Waypoint name:') || 'Waypoint',
      type: prompt('Waypoint type (depot/collection_zone/waypoint/special_zone):') || 'waypoint'
    };
    
    currentRoute.waypoints = currentRoute.waypoints || [];
    currentRoute.waypoints.push(waypoint);
    
    layer.bindPopup(`<b>${waypoint.name}</b><br>Type: ${waypoint.type}`);
    drawnItems.addLayer(layer);
  }
});

// Save route to database
async function saveRoute(routeData) {
  try {
    const response = await fetch('/api/admin/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        route_name: routeData.name,
        route_code: routeData.code,
        work_zone_id: routeData.zone_id,
        route_coordinates: JSON.stringify(routeData.coordinates),
        waypoints: JSON.stringify(routeData.waypoints),
        total_distance_km: routeData.distance,
        estimated_travel_time_minutes: routeData.estimated_time,
        active_days: routeData.active_days
      })
    });
    
    if (response.ok) {
      const savedRoute = await response.json();
      showSuccess('Route saved successfully!');
      loadRoutes(); // Refresh route list
    } else {
      showError('Failed to save route');
    }
  } catch (error) {
    console.error('Error saving route:', error);
    showError('Network error occurred');
  }
}
```

---

*Tài liệu này bây giờ đã bao gồm đầy đủ hệ thống quản lý tuyến đường và tracking GPS real-time cho Leaflet map integration, đáp ứng yêu cầu phát triển tương lai của bạn.*
