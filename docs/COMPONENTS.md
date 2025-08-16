# Components Documentation - Tài liệu chi tiết các Component

## Mobile-First Responsive Components

### ResponsiveTable (`/components/ui/responsive-table.tsx`)

- **Purpose**: Mobile-first table that converts to card view on small screens
- **Features**: Expandable rows, priority-based columns, automatic mobile labels
- **Usage**: Import as replacement for standard table components
- **Breakpoint**: Converts at `md` (768px)
- **Documentation**: See `/docs/MOBILE_RESPONSIVE_IMPLEMENTATION.md` for detailed usage

### ResponsiveMapContainer (`/components/ui/responsive-map.tsx`)

- **Purpose**: Mobile-optimized map wrapper with touch controls
- **Features**: Fullscreen mode, bottom control bar, zoom controls
- **Usage**: Wrap around map components for mobile support
- **Dependencies**: Dynamic map loading to avoid SSR issues

### MobileDashboard (`/components/ui/mobile-dashboard.tsx`)

- **Purpose**: Complete mobile dashboard layout system
- **Components**: StatsGrid, StatCard, CollapsibleSection, QuickActions, MobileFilters
- **Features**: Responsive grid, collapsible sections, action overflow handling
- **Usage**: Use as page wrapper for dashboard layouts

---

## 1. Landing Page Components

### 1.1. HeroSection Component

**File**: `components/landing/hero-section.tsx`

**Mục đích**: Phần hero chính của trang landing, thu hút sự chú ý và giới thiệu dịch vụ

**Props**: Không có props (sử dụng i18n internally)

**Cấu trúc**:

```tsx
export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      {/* Background decoration với gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-70" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span>{t("hero.sustainable")}</span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground md:text-xl">
              {t("hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="group">
                  {t("hero.getStarted")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  {t("hero.learnMore")}
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted overflow-hidden"
                  >
                    <span className="font-medium">U{i}</span>
                  </div>
                ))}
              </div>
              <div>{t("hero.trustedBy", { count: 2000 })}</div>
            </div>
          </div>

          {/* Right Column: Demo UI */}
          <div className="relative bg-gradient-to-b from-primary/20 to-muted p-4 rounded-2xl">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-background/40 backdrop-blur-sm border shadow-xl">
              <div className="p-4 md:p-6 h-full flex flex-col">
                {/* Mock collection schedule UI */}
                <div className="font-medium mb-2">
                  {t("hero.collectionSchedule")}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[t("days.mon"), t("days.wed"), t("days.fri")].map(
                    (day, idx) => (
                      <div
                        key={day}
                        className="p-2 rounded-md bg-accent/80 text-center text-sm"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Next collection card */}
                <div className="rounded-lg bg-card p-3 mb-3 flex items-center">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {t("hero.nextCollection")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("hero.tomorrowTime")}
                    </div>
                  </div>
                </div>

                {/* Special collection card */}
                <div className="rounded-lg bg-card p-3 flex items-center">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <div className="h-6 w-6 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {t("hero.specialCollection")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("hero.requestedForSaturday")}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-auto pt-4 flex justify-end">
                  <div className="inline-flex h-8 items-center rounded-full border px-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                    <span>
                      {t("hero.collectionStatus", { status: t("hero.active") })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Key Features**:

- Responsive 2-column layout với breakpoints
- Background decoration với CSS gradients
- Interactive CTA buttons với hover animations
- Mock UI demo cho collection schedule
- Social proof elements với avatar placeholders
- Full i18n support

**Styling Details**:

- Sử dụng Tailwind classes cho responsive design
- `group` utility để handle hover states của child elements
- `backdrop-blur-sm` cho glassmorphism effect
- CSS Grid để layout các elements
- Custom spacing với `gap-*` và padding utilities

### 1.2. FeatureSection Component

**File**: `components/landing/feature-section.tsx`

**Mục đích**: Showcase các tính năng chính của hệ thống

**Cấu trúc chính**:

```tsx
const features = [
  {
    icon: Calendar,
    title: t("features.smartScheduling.title"),
    description: t("features.smartScheduling.description"),
  },
  {
    icon: Bell,
    title: t("features.realTimeNotifications.title"),
    description: t("features.realTimeNotifications.description"),
  },
  // ... more features
];

return (
  <section className="py-24">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("features.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
```

**Features List**:

1. **Smart Scheduling**: Lịch trình thu gom thông minh
2. **Real-Time Notifications**: Thông báo real-time
3. **Flexible Payments**: Thanh toán linh hoạt
4. **Urgent Pickups**: Thu gom khẩn cấp
5. **Location Tracking**: Theo dõi vị trí
6. **Collection Analytics**: Phân tích thu gom

### 1.3. HowItWorks Component

**File**: `components/landing/how-it-works.tsx`

**Mục đích**: Giải thích quy trình sử dụng dịch vụ

**Process Steps**:

1. **Đăng ký tài khoản**: User registration
2. **Chọn gói dịch vụ**: Service package selection
3. **Lên lịch thu gom**: Schedule setup
4. **Nhận thông báo**: Get notifications
5. **Thu gom & đánh giá**: Collection & feedback

## 2. Authentication Components

### 2.1. Login Page Component

**File**: `app/(auth)/login/page.tsx`

**Form Schema**:

```typescript
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["user", "collector", "admin"]),
});
```

**Key Features**:

- **Tabs System**: Credentials login vs OTP login
- **Role Selection**: Dropdown để chọn user type
- **Form Validation**: Real-time validation với Zod
- **Loading States**: Button loading khi submit
- **Redirect Logic**: Redirect theo role sau login
- **Forgot Password Link**: Link tới password recovery

**Credentials Tab Fields**:

- `email`: Email input với validation
- `password`: Password input với visibility toggle
- `role`: Select dropdown (user/collector/admin)

**OTP Tab Fields**:

- `phone`: Phone number input
- Send OTP button (chưa implement backend)

**Submit Handler**:

```typescript
function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true);

  // Mock authentication với timeout
  setTimeout(() => {
    setIsLoading(false);
    // Redirect based on role
    if (values.role === "user") {
      router.push("/dashboard/user");
    } else if (values.role === "collector") {
      router.push("/dashboard/collector");
    } else {
      router.push("/dashboard/admin");
    }
  }, 1500);
}
```

### 2.2. Register Page Component

**File**: `app/(auth)/register/page.tsx`

**Form Schema**:

```typescript
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    address: z.string().min(5, { message: "Please enter your full address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
```

**Form Fields**:

- `name`: Họ tên đầy đủ
- `email`: Email đăng nhập
- `phone`: Số điện thoại (cho OTP)
- `address`: Địa chỉ đầy đủ
- `password`: Mật khẩu
- `confirmPassword`: Xác nhận mật khẩu
- `terms`: Checkbox đồng ý điều khoản

**Validation Rules**:

- Name: minimum 2 characters
- Email: valid email format
- Phone: minimum 10 digits
- Address: minimum 5 characters
- Password: minimum 8 characters
- Confirm password must match password
- Terms checkbox must be checked

## 3. Dashboard Layout Components

### 3.1. Dashboard Layout

**File**: `app/dashboard/layout.tsx`

**Key Features**:

- **Role Detection**: Auto-detect role từ URL path
- **Responsive Design**: Desktop sidebar, mobile hamburger menu
- **User Info Display**: Different info dựa trên role
- **Dynamic Title**: Page title changes theo route
- **i18n Support**: Multi-language navigation

**Role Detection Logic**:

```typescript
useEffect(() => {
  if (pathname.includes("/dashboard/user")) {
    setRole("user");
  } else if (pathname.includes("/dashboard/collector")) {
    setRole("collector");
  } else if (pathname.includes("/dashboard/admin")) {
    setRole("admin");
  }

  // Set title based on current path
  const path = pathname.split("/").pop();
  if (path && path !== role) {
    setTitle(t(path));
  } else {
    setTitle(t("dashboard"));
  }
}, [pathname, t, role]);
```

**User Info Mock Data**:

```typescript
const getUserInfo = () => {
  switch (role) {
    case "user":
      return { name: "John Doe", email: "john@example.com" };
    case "collector":
      return { name: "Michael Torres", email: "michael@ecocollect.com" };
    case "admin":
      return { name: "Admin User", email: "admin@ecocollect.com" };
  }
};
```

**Layout Structure**:

- **Mobile**: Header với hamburger menu, collapsible sidebar
- **Desktop**: Fixed sidebar + main content area
- **Header**: Logo, user info, mobile menu trigger
- **Sidebar**: Role-based navigation menu
- **Main**: Page content với padding

### 3.2. SidebarNav Component

**File**: `components/dashboard/sidebar-nav.tsx`

**Props**:

```typescript
interface SidebarNavProps {
  role: "user" | "collector" | "admin";
}
```

**Navigation Items Structure**:

```typescript
interface NavItem {
  title: string;
  href: string;
  icon: any; // Lucide icon component
}

interface UserNavItems {
  user: NavItem[];
  collector: NavItem[];
  admin: NavItem[];
}
```

**User Navigation Items**:

- Dashboard: `/dashboard/user` (Home icon)
- Collection Schedule: `/dashboard/user/schedule` (Calendar icon)
- Request Collection: `/dashboard/user/request` (Clock icon)
- Payments: `/dashboard/user/payments` (CreditCard icon)
- Notifications: `/dashboard/user/notifications` (Bell icon)
- Support: `/dashboard/user/support` (MessageSquare icon)
- Settings: `/dashboard/user/settings` (Settings icon)

**Collector Navigation Items**:

- Dashboard: `/dashboard/collector` (Home icon)
- Today's Collections: `/dashboard/collector/today` (Truck icon)
- Collection Map: `/dashboard/collector/map` (Map icon)
- Check-in: `/dashboard/collector/checkin` (CheckSquare icon)
- Urgent Requests: `/dashboard/collector/urgent` (Clock icon)
- Performance: `/dashboard/collector/performance` (BarChart icon)
- Notifications: `/dashboard/collector/notifications` (Bell icon)
- Settings: `/dashboard/collector/settings` (Settings icon)

**Admin Navigation Items**:

- Dashboard: `/dashboard/admin` (Home icon)
- Users: `/dashboard/admin/users` (Users icon)
- Collectors: `/dashboard/admin/collectors` (Truck icon)
- Schedules: `/dashboard/admin/schedules` (Calendar icon)
- Payments: `/dashboard/admin/payments` (CreditCard icon)
- Reports: `/dashboard/admin/reports` (BarChart icon)
- Feedback: `/dashboard/admin/feedback` (MessageSquare icon)
- Settings: `/dashboard/admin/settings` (Settings icon)

**Active State Logic**:

```typescript
const pathname = usePathname()

<Link
  key={item.href}
  href={item.href}
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors",
    pathname === item.href ? "bg-accent" : "transparent"
  )}
>
  <item.icon className="h-4 w-4" />
  {t(item.title)}
</Link>
```

### 3.3. DashboardHeader Component

**File**: `components/dashboard/dashboard-header.tsx`

**Props**:

```typescript
interface DashboardHeaderProps {
  title: string;
  userInfo: {
    name: string;
    email: string;
  };
}
```

**Features**:

- Dynamic page title display
- User dropdown menu với avatar
- Breadcrumb navigation (optional)
- Theme toggle button
- Logout functionality

## 4. User Dashboard Components

### 4.1. User Dashboard Main Page

**File**: `app/dashboard/user/page.tsx`

**Key Stats Cards**:

#### Next Collection Card

```typescript
const nextCollection = {
  date: "Ngày mai, 5:00 AM",
  status: "Scheduled"
}

<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      {t('nextCollection')}
    </CardTitle>
    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{nextCollection.date}</div>
    <p className="text-xs text-muted-foreground mt-1">
      {t('status')}: {statusMap[nextCollection.status]}
    </p>
    <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full w-[75%]"></div>
    </div>
  </CardContent>
</Card>
```

#### Collection History Card

- **Metric**: 12 collections this month
- **Progress**: 90% completion rate
- **Icon**: Truck icon
- **Color**: Emerald for completed collections

#### Current Plan Card

- **Plan Type**: Monthly/Quarterly/Yearly
- **Next Payment**: Date và amount
- **Status**: Active/Expired
- **Icon**: CreditCard icon

#### Special Requests Card

- **Count**: Number của urgent requests
- **Limit**: Usage limit (2/5)
- **Icon**: Clock icon
- **Usage Bar**: Visual progress

**Recent Collections Section**:

```typescript
const recentCollections = [
  {
    date: "Ngày 10, Tháng 4, 2025",
    status: "Completed",
    collector: "Michael T."
  },
  // ... more items
]

<div className="space-y-4">
  {recentCollections.map((collection, index) => (
    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <div className="font-medium">{collection.date}</div>
          <div className="text-sm text-muted-foreground">
            {t('collector')}: {collection.collector}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-emerald-700 border-emerald-500/30 bg-emerald-500/10">
          {statusMap[collection.status]}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

### 4.2. User Schedule Page

**File**: `app/dashboard/user/schedule/page.tsx`

**Components Used**:

- `Calendar`: Date picker component từ shadcn/ui
- `Table`: Schedule list display
- `Dialog`: Feedback modal
- `Badge`: Status indicators

**Mock Data Structure**:

```typescript
interface CollectionSchedule {
  id: string;
  date: string; // ISO date
  type: "regular" | "urgent";
  status: "collected" | "pending" | "overdue";
  address: string;
  feedback?: CollectionFeedback;
}

interface CollectionFeedback {
  stars: number;
  comment?: string;
  date: string; // ISO
  collectorId: string;
}

export const mockSchedule: CollectionSchedule[] = [
  {
    id: "1",
    date: new Date().toISOString().slice(0, 10), // Today
    type: "regular",
    status: "collected",
    address: "123 Đường 17, Phường Linh Trung, Quận Thủ Đức",
  },
  {
    id: "2",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10), // 3 days ago
    type: "regular",
    status: "collected",
    address: "123 Đường 17, Phường Linh Trung, Quận Thủ Đức",
    feedback: {
      stars: 5,
      comment: "Rất hài lòng với dịch vụ!",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      collectorId: "col1",
    },
  },
];
```

**Calendar Integration**:

```typescript
// Highlight dates with scheduled collections
const scheduledDates = mockSchedule.map((item) => item.date);

<Calendar
  mode="single"
  selected={selected}
  onSelect={setSelected}
  className="rounded-md border"
  modifiers={{
    scheduled: scheduledDates.map((dateStr) => parseISO(dateStr)),
  }}
  modifiersStyles={{
    scheduled: { backgroundColor: "hsl(var(--primary))", color: "white" },
  }}
/>;
```

**Feedback Dialog**:

- **Trigger**: Chỉ hiển thị cho collections đã hoàn thành
- **Fields**: Star rating (1-5), comment textarea
- **Validation**: Required star rating
- **Business Rule**: Có thể feedback trong 7 ngày sau collection

### 4.3. User Support Page

**File**: `app/dashboard/user/support/page.tsx`

**Mock Data Types**:

```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "payment" | "schedule" | "account" | "issue" | "other";
}

interface SupportRequest {
  id: string;
  type: "payment" | "schedule" | "issue" | "account" | "other";
  title: string;
  description: string;
  status: "pending" | "resolved" | "rejected";
  createdAt: string; // ISO
  feedback?: SupportFeedback;
}
```

**FAQ Categories**:

- **Payment**: Thanh toán, hóa đơn
- **Schedule**: Lịch thu gom
- **Account**: Tài khoản, đăng nhập
- **Issue**: Khiếu nại, sự cố
- **Other**: Khác

**Support Request Form**:

- **Type**: Dropdown selection
- **Title**: Tiêu đề vấn đề
- **Description**: Mô tả chi tiết
- **File Upload**: Đính kèm hình ảnh (optional)

## 5. Collector Dashboard Components

### 5.1. Collector Main Dashboard

**File**: `app/dashboard/collector/page.tsx`

**Collection Points Management**:

```typescript
const [points, setPoints] = useState(mockCollectionPoints);

const handleCheckIn = (id: string) => {
  setPoints((prev) =>
    prev.map((cp) =>
      cp.id === id
        ? {
            ...cp,
            status: CollectionStatus.IN_PROGRESS,
            checkInTime: new Date().toLocaleTimeString(),
          }
        : cp
    )
  );
};

const handleUpdateStatus = (id: string, status: CollectionStatus) => {
  setPoints((prev) =>
    prev.map((cp) => (cp.id === id ? { ...cp, status } : cp))
  );
};
```

**Performance Metrics**:

- **Today's Collections**: Total vs completed
- **Route Progress**: Percentage completed với ETA
- **Efficiency Rate**: Time per collection với trends
- **Urgent Requests**: Count với quick action

### 5.2. CollectionPointList Component

**File**: `components/dashboard/collection/today/CollectionPointList.tsx`

**Props Interface**:

```typescript
interface CollectionPointListProps {
  points: CollectionPoint[];
  onCheckIn: (id: string) => void;
  onUpdateStatus: (id: string, status: CollectionStatus) => void;
  onOpenMap: (id: string) => void;
  onUploadPhoto: (id: string) => void;
  onAddNote: (id: string) => void;
}
```

**Point Item Structure**:

```typescript
<div className="border rounded-lg p-4 space-y-4">
  {/* Header: Address & Time */}
  <div className="flex items-start justify-between">
    <div>
      <h3 className="font-medium">{point.address}</h3>
      <p className="text-sm text-muted-foreground">{point.scheduledTime}</p>
    </div>
    <Badge variant={getStatusVariant(point.status)}>
      {getStatusLabel(point.status)}
    </Badge>
  </div>

  {/* Details */}
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="text-muted-foreground">Waste Type:</span>
      <span className="ml-2">{point.wasteType}</span>
    </div>
    {point.specialNotes && (
      <div className="col-span-2">
        <span className="text-muted-foreground">Notes:</span>
        <span className="ml-2">{point.specialNotes}</span>
      </div>
    )}
  </div>

  {/* Actions */}
  <div className="flex gap-2 flex-wrap">
    {point.status === CollectionStatus.PENDING && (
      <Button size="sm" onClick={() => onCheckIn(point.id)}>
        Check In
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={() => onOpenMap(point.id)}>
      <MapPin className="w-4 h-4 mr-1" />
      Map
    </Button>
    {point.requiresPhoto && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUploadPhoto(point.id)}
      >
        <Camera className="w-4 h-4 mr-1" />
        Photo
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={() => onAddNote(point.id)}>
      <FileText className="w-4 h-4 mr-1" />
      Note
    </Button>
  </div>

  {/* Progress Info */}
  {point.checkInTime && (
    <div className="text-xs text-muted-foreground border-t pt-2">
      Checked in at {point.checkInTime}
    </div>
  )}
</div>
```

**Status Management**:

```typescript
enum CollectionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANNOT_COLLECT = "CANNOT_COLLECT",
}

const getStatusVariant = (status: CollectionStatus) => {
  switch (status) {
    case CollectionStatus.PENDING:
      return "outline";
    case CollectionStatus.IN_PROGRESS:
      return "default";
    case CollectionStatus.COMPLETED:
      return "success";
    case CollectionStatus.CANNOT_COLLECT:
      return "destructive";
  }
};
```

### 5.3. Collector Performance Page

**File**: `app/dashboard/collector/performance/page.tsx`

**Mock Data Structure**:

```typescript
interface PerformanceSummaryData {
  totalCollections: number; // 128
  onTimeRate: number; // 92%
  urgentHandled: number; // 14
  positiveFeedback: number; // 37
  negativeFeedback: number; // 3
  absences: number; // 1
  ranking: number; // 3rd place
  avgSystemCollections: number; // 110 (system average)
}

interface PerformanceChartData {
  date: string; // '2024-05-27'
  collections: number;
  onTime: number;
  late: number;
  missed: number;
}

interface CollectionHistoryItem {
  id: string;
  date: string;
  address: string;
  status: "completed" | "missed" | "late";
  feedback?: {
    rating: number;
    comment?: string;
  };
  timeSpent: number; // minutes
}
```

**Charts Integration**:

- **Daily Performance**: Line chart với collections per day
- **On-time Rate**: Progress bars
- **Feedback Trends**: Star ratings over time
- **Comparative Analytics**: Performance vs system average

## 6. Admin Components

### 6.1. Admin Dashboard Main

**File**: `app/dashboard/admin/page.tsx`

**KPI Cards**:

```typescript
const stats = {
  totalUsers: { value: 2834, change: "+12.5%", trend: "up" },
  activeCollectors: { value: 48, change: "+3", trend: "up" },
  totalRevenue: { value: "$45,280", change: "+8.2%", trend: "up" },
  collectionsToday: { value: 245, change: "-4.5%", trend: "down" },
};
```

**Charts Configuration**:

```typescript
// Weekly collections bar chart
const collectionData = [
  { name: "Thứ 2", collections: 180 },
  { name: "Thứ 3", collections: 220 },
  { name: "Thứ 4", collections: 192 },
  { name: "Thứ 5", collections: 235 },
  { name: "Thứ 6", collections: 118 },
  { name: "Thứ 7", collections: 95 },
]

<ResponsiveContainer width="100%" height="100%">
  <BarChart data={collectionData}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip
      contentStyle={{
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
      }}
    />
    <Bar
      dataKey="collections"
      fill="hsl(var(--chart-1))"
      radius={[4, 4, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
```

**System Status Panel**:

- Server uptime: 99.9% với progress bar
- Database load: 68% với color coding
- API response time: 230ms
- Notifications delivered: 95.2%

### 6.2. Admin Payments Management

**File**: `app/dashboard/admin/payments/page.tsx`

**Component**: `PaymentsTabs`

**Features**:

- **Dual Tab System**: User payments vs Collector payments
- **Filtering**: By period, status, amount range
- **Search**: By name, code, address
- **Bulk Actions**: Approve/reject multiple payments
- **Export**: CSV/Excel export functionality

**User Payments Table Columns**:

- User Name & Household Code
- Address
- Service Package
- Period
- Amount
- Payment Method
- Status
- Actions (View, Edit, Process)

**Collector Payments Table Columns**:

- Collector Name & Code
- Work Area
- Period
- Total Shifts
- Amount
- Status
- Actions (View, Approve, Reject)

**Payment Detail Modal**:

- Complete payment history
- Supporting documents
- Admin notes
- Approval workflow

### 6.3. Admin Schedules Management

**File**: `app/dashboard/admin/schedules/page.tsx`

**Components**:

- `SchedulesTable`: Main data table
- `ScheduleFormDialog`: Create/edit schedules
- `ScheduleDetailDialog`: View schedule details
- `CollectorAssignmentDialog`: Assign collectors

**Schedule Creation Workflow**:

1. **Basic Info**: Name, period, description
2. **Zone Assignment**: Select coverage areas
3. **Time Slots**: Define collection windows
4. **Collector Assignment**: Assign staff to routes
5. **Route Optimization**: Optimize collection paths
6. **Review & Publish**: Final review before activation

**Route Mapping Integration**:

```typescript
<GoogleMap
  mapContainerStyle={{ width: "100%", height: "400px" }}
  center={{ lat: 10.762622, lng: 106.660172 }} // Ho Chi Minh City
  zoom={12}
>
  {schedule.route.points.map((point, index) => (
    <Marker
      key={point.id}
      position={{ lat: point.lat, lng: point.lng }}
      title={point.address}
      icon={{
        url:
          point.type === "start"
            ? "/icons/start-marker.png"
            : point.type === "end"
            ? "/icons/end-marker.png"
            : "/icons/collection-marker.png",
        scaledSize: new window.google.maps.Size(30, 30),
      }}
    />
  ))}

  {/* Draw route polyline */}
  <Polyline
    path={schedule.route.points.map((p) => ({ lat: p.lat, lng: p.lng }))}
    options={{
      strokeColor: "#3B82F6",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    }}
  />
</GoogleMap>
```

### 6.4. Admin Reports System

**File**: `app/dashboard/admin/reports/page.tsx`

**Report Types**:

1. **Revenue Reports**: Financial performance
2. **Operational Reports**: Collection metrics
3. **User Analytics**: Customer behavior
4. **Collector Performance**: Staff metrics
5. **System Usage**: Technical metrics

**Widget Components**:

- `RevenueWidget`: Revenue trends and breakdowns
- `UserPaymentWidget`: Payment analytics
- `CollectorPaymentWidget`: Payroll analytics
- `CollectionStatsWidget`: Collection performance
- `CustomerSatisfactionWidget`: Feedback analysis

**Export Functionality**:

```typescript
const exportReport = async (type: "pdf" | "excel", data: any) => {
  const response = await fetch("/api/admin/reports/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data, format: type }),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${new Date().toISOString().slice(0, 10)}.${type}`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

## 7. UI Component Patterns

### 7.1. Form Handling Pattern

**Standard Form Pattern**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  field1: z.string().min(1, "Required"),
  field2: z.string().email("Invalid email"),
});

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field1: "",
      field2: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle submission
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field 1</FormLabel>
              <FormControl>
                <Input placeholder="Enter value" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 7.2. Dialog Pattern

**Standard Dialog Pattern**:

```typescript
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MyDialog() {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  const handleEdit = (item: ItemType) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const handleSave = (data: any) => {
    // Process data
    setOpen(false);
    setSelectedItem(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div>{/* Dialog content */}</div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleSave({})}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 7.3. Table Pattern

**Data Table Pattern**:

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={index}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render
                  ? column.render(item[column.key], item)
                  : String(item[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 7.4. Status Badge Pattern

**Consistent Status Badges**:

```typescript
interface StatusBadgeProps {
  status: "pending" | "completed" | "cancelled" | "overdue";
  variant?: "default" | "outline";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const configs = {
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    overdue: {
      label: "Overdue",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = configs[status];

  return (
    <Badge
      variant={variant}
      className={variant === "default" ? config.className : ""}
    >
      {config.label}
    </Badge>
  );
}
```

## 8. Performance Optimization

### 8.1. Component Memoization

**React.memo Usage**:

```typescript
import React from "react";

interface ItemProps {
  item: ComplexItem;
  onUpdate: (id: string, data: any) => void;
}

export const ExpensiveItem = React.memo<ItemProps>(
  ({ item, onUpdate }) => {
    // Expensive rendering logic
    return <div>{/* Complex UI */}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.updatedAt === nextProps.item.updatedAt
    );
  }
);
```

### 8.2. useMemo and useCallback

**Expensive Calculations**:

```typescript
import { useMemo, useCallback } from "react";

function DataProcessor({ items, filters }: Props) {
  // Memoize expensive filtering/sorting
  const processedItems = useMemo(() => {
    return items
      .filter((item) => matchesFilters(item, filters))
      .sort((a, b) => sortComparator(a, b));
  }, [items, filters]);

  // Memoize event handlers
  const handleItemUpdate = useCallback((id: string, data: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  }, []);

  return (
    <div>
      {processedItems.map((item) => (
        <Item key={item.id} item={item} onUpdate={handleItemUpdate} />
      ))}
    </div>
  );
}
```

### 8.3. Code Splitting

**Lazy Loading Components**:

```typescript
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));
const AdminReports = lazy(() => import("./AdminReports"));

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart data={chartData} />
      </Suspense>

      <Suspense fallback={<div>Loading reports...</div>}>
        <AdminReports />
      </Suspense>
    </div>
  );
}
```

---

_Tài liệu này cung cấp chi tiết implementation của tất cả components chính trong hệ thống EcoCollect. Mỗi component được thiết kế theo patterns nhất quán để đảm bảo maintainability và reusability._
