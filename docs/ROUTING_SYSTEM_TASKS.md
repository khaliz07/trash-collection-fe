# Routing System Implementation Tasks

## Tổng quan hệ thống

### Kiến trúc Route System

```
Route System = Route Path (Google Maps) + Urgent Request Points (overlay)
- Route: Đường đi cố định (circular), không có collection points gia đình
- Urgent Points: Dynamic points được add vào route khi có yêu cầu khẩn cấp
- Auto-assignment: Urgent requests tự động assign vào route gần nhất
```

### Core Components

1. **Admin Route Management** (dashboard/admin/schedules)
2. **Collector Route View** (dashboard/collector/map)
3. **Urgent Request Integration** (dashboard/user/request)
4. **Google Maps Integration** với Directions API
5. **Real-time Tracking** với basic location updates

---

## PHASE 1: Database Schema Updates

### Task 1.1: Update Collection Routes Table

**File:** `prisma/schema.prisma`

```sql
-- Update existing collection_routes table
model CollectionRoute {
  id                    String   @id @default(cuid())
  route_name           String
  route_code           String   @unique
  work_zone_id         String?

  -- Google Maps route data
  route_path           Json     // Google Directions API response
  route_polyline       String   // Encoded polyline from Google
  total_distance_km    Decimal  @db.Decimal(8,3)
  estimated_time_min   Int

  -- Route schedule
  active_days          Json     // ["monday", "wednesday", "friday"]
  time_windows         Json     // [{"start": "08:00", "end": "12:00"}]

  -- Status and management
  status               RouteStatus @default(ACTIVE)
  created_by           String
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt

  -- Relations
  assignments          RouteAssignment[]
  urgent_requests      UrgentRequest[]

  @@map("collection_routes")
}

enum RouteStatus {
  DRAFT
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Task 1.2: Create Route Assignment Table

```sql
model RouteAssignment {
  id               String   @id @default(cuid())
  route_id         String
  collector_id     String
  assigned_date    DateTime
  time_window_start String // "08:00"
  time_window_end   String // "12:00"

  -- Execution tracking
  status           AssignmentStatus @default(PENDING)
  started_at       DateTime?
  completed_at     DateTime?

  -- Performance metrics
  actual_distance  Decimal? @db.Decimal(8,3)
  actual_duration  Int?     // minutes

  route            CollectionRoute @relation(fields: [route_id], references: [id])
  collector        Collector @relation(fields: [collector_id], references: [id])

  @@unique([route_id, collector_id, assigned_date])
  @@map("route_assignments")
}

enum AssignmentStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Task 1.3: Update Urgent Requests Integration

```sql
model UrgentRequest {
  id                   String   @id @default(cuid())
  user_id              String

  -- Request details
  pickup_address       String
  pickup_lat           Decimal  @db.Decimal(10,8)
  pickup_lng           Decimal  @db.Decimal(11,8)
  requested_date       DateTime
  urgency_level        UrgencyLevel
  waste_description    String

  -- Auto-assignment
  assigned_route_id    String?
  assigned_collector_id String?
  assigned_at          DateTime?

  -- Status
  status               UrgentStatus @default(PENDING)
  completed_at         DateTime?

  route                CollectionRoute? @relation(fields: [assigned_route_id], references: [id])
  collector            Collector? @relation(fields: [assigned_collector_id], references: [id])

  @@map("urgent_requests")
}

enum UrgencyLevel {
  MEDIUM
  HIGH
  CRITICAL
}

enum UrgentStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## PHASE 2: Google Maps Integration

### Task 2.1: Google Maps Services Setup

**File:** `src/lib/google-maps.ts`

```typescript
// Google Maps API integration
export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  }

  // Create route using Directions API
  async createRoute(waypoints: LatLng[]): Promise<GoogleRoute> {
    const directionsService = new google.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin: waypoints[0],
      destination: waypoints[waypoints.length - 1],
      waypoints: waypoints.slice(1, -1).map((point) => ({
        location: point,
        stopover: false,
      })),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    const result = await directionsService.route(request);

    return {
      polyline: result.routes[0].overview_polyline.points,
      distance: this.calculateTotalDistance(result.routes[0]),
      duration: this.calculateTotalDuration(result.routes[0]),
      waypoints: result.routes[0].waypoint_order,
    };
  }

  // Calculate distance to nearest route
  async findNearestRoute(
    location: LatLng,
    routes: RouteData[]
  ): Promise<string> {
    const distanceService = new google.maps.DistanceMatrixService();

    // Implementation for finding nearest route
    // Returns route_id of closest route
  }
}
```

### Task 2.2: Route Types Definition

**File:** `src/types/route.ts`

```typescript
export interface RouteData {
  id: string;
  name: string;
  code: string;
  path: LatLng[];
  polyline: string;
  distance_km: number;
  estimated_time_min: number;
  active_days: string[];
  time_windows: TimeWindow[];
  status: RouteStatus;
}

export interface UrgentPoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  urgency_level: "medium" | "high" | "critical";
  status: "pending" | "assigned" | "completed";
  requested_at: string;
}

export interface RouteWithUrgents {
  route: RouteData;
  urgent_points: UrgentPoint[];
  assigned_collector?: CollectorInfo;
}

export interface TimeWindow {
  start: string; // "08:00"
  end: string; // "12:00"
}
```

---

## PHASE 3: Admin Route Management

### Task 3.1: Enhanced ScheduleMapView

**File:** `src/components/admin/schedules/ScheduleMapView.tsx`

```typescript
"use client";
import {
  GoogleMap,
  Polyline,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { RouteWithUrgents, UrgentPoint } from "@/types/route";

interface EnhancedScheduleMapViewProps {
  routeData: RouteWithUrgents;
  height?: number;
}

export function EnhancedScheduleMapView({
  routeData,
  height = 300,
}: EnhancedScheduleMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-[300px]">
        Loading map...
      </div>
    );

  const { route, urgent_points } = routeData;

  // Decode polyline for route path
  const routePath = google.maps.geometry.encoding.decodePath(route.polyline);

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: `${height}px` }}
      center={routePath[0]}
      zoom={13}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Route Path */}
      <Polyline
        path={routePath}
        options={{
          strokeColor: "#2563eb",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }}
      />

      {/* Start/End Points */}
      <Marker
        position={routePath[0]}
        icon={{
          url: "/icons/start-point.png",
          scaledSize: new google.maps.Size(30, 30),
        }}
        title="Điểm bắt đầu"
      />

      <Marker
        position={routePath[routePath.length - 1]}
        icon={{
          url: "/icons/end-point.png",
          scaledSize: new google.maps.Size(30, 30),
        }}
        title="Điểm kết thúc"
      />

      {/* Urgent Request Points */}
      {urgent_points.map((point) => (
        <Marker
          key={point.id}
          position={{ lat: point.lat, lng: point.lng }}
          icon={{
            url: getUrgentIcon(point.urgency_level),
            scaledSize: new google.maps.Size(25, 25),
          }}
          title={`Yêu cầu khẩn cấp: ${point.address}`}
        />
      ))}
    </GoogleMap>
  );
}

function getUrgentIcon(level: string): string {
  const icons = {
    medium: "/icons/urgent-medium.png",
    high: "/icons/urgent-high.png",
    critical: "/icons/urgent-critical.png",
  };
  return icons[level] || icons.medium;
}
```

### Task 3.2: Route Creation Interface

**File:** `src/components/admin/routes/RouteCreator.tsx`

```typescript
"use client";
import { useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { GoogleMapsService } from "@/lib/google-maps";

export function RouteCreator() {
  const [waypoints, setWaypoints] = useState<google.maps.LatLng[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setWaypoints((prev) => [...prev, event.latLng!]);
    }
  };

  const createRoute = async () => {
    if (waypoints.length < 2) return;

    setIsCreating(true);
    try {
      const mapsService = new GoogleMapsService();
      const route = await mapsService.createRoute(waypoints);
      setRouteData(route);
    } catch (error) {
      console.error("Failed to create route:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Tạo tuyến đường mới</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click trên bản đồ để thêm các điểm dừng. Tuyến đường sẽ tự động tối
          ưu.
        </p>

        <div className="flex gap-2">
          <button
            onClick={createRoute}
            disabled={waypoints.length < 2 || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Đang tạo..." : "Tạo tuyến đường"}
          </button>

          <button
            onClick={() => setWaypoints([])}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={{ lat: 10.762622, lng: 106.660172 }} // Ho Chi Minh City
        zoom={13}
        onClick={handleMapClick}
      >
        {waypoints.map((point, index) => (
          <Marker key={index} position={point} label={(index + 1).toString()} />
        ))}

        {routeData && (
          <Polyline
            path={google.maps.geometry.encoding.decodePath(routeData.polyline)}
            options={{
              strokeColor: "#16A34A",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            }}
          />
        )}
      </GoogleMap>

      {routeData && (
        <RouteForm routeData={routeData} onSave={handleSaveRoute} />
      )}
    </div>
  );
}
```

### Task 3.3: Enhanced ScheduleSidebar with Full CRUD

**File:** `src/components/admin/schedules/ScheduleSidebar.tsx`

```typescript
"use client";
import { useState } from "react";
import { EnhancedScheduleMapView } from "./EnhancedScheduleMapView";
import { RouteEditor } from "./RouteEditor";
import { ScheduleHistory } from "./ScheduleHistory";
import { CollectorAssignment } from "./CollectorAssignment";

export function EnhancedScheduleSidebar({
  open,
  schedule,
  onClose,
}: ScheduleSidebarProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "edit" | "history" | "assign"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);

  if (!schedule) return null;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-lg flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: "45vw", minWidth: 500 }}
      >
        {/* Header with Tabs */}
        <div className="border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold">Quản lý tuyến đường</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            {[
              { key: "overview", label: "Tổng quan" },
              { key: "edit", label: "Chỉnh sửa" },
              { key: "history", label: "Lịch sử" },
              { key: "assign", label: "Phân công" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <OverviewTab
              schedule={schedule}
              onEditClick={() => setActiveTab("edit")}
              onHistoryClick={() => setActiveTab("history")}
            />
          )}

          {activeTab === "edit" && (
            <EditTab
              schedule={schedule}
              onSave={(updatedSchedule) => {
                // Handle save logic
                setActiveTab("overview");
              }}
              onCancel={() => setActiveTab("overview")}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              collectorId={schedule.collector.id}
              routeId={schedule.route.id}
            />
          )}

          {activeTab === "assign" && (
            <AssignmentTab
              schedule={schedule}
              onAssign={(collectorId, timeWindow) => {
                // Handle assignment logic
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Đóng
            </button>

            {activeTab === "overview" && (
              <>
                <button
                  onClick={() => setActiveTab("edit")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Chỉnh sửa tuyến đường
                </button>

                <button
                  onClick={() => duplicateRoute(schedule.route.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Nhân bản tuyến đường
                </button>

                <button
                  onClick={() => deleteRoute(schedule.route.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Xóa tuyến đường
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ schedule, onEditClick, onHistoryClick }) {
  return (
    <div className="px-6 py-4 space-y-6">
      {/* Route Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{schedule.route.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Mã tuyến:</span>
            <span className="ml-2 font-medium">{schedule.route.code}</span>
          </div>
          <div>
            <span className="text-gray-600">Khoảng cách:</span>
            <span className="ml-2 font-medium">
              {schedule.route.distance_km}km
            </span>
          </div>
          <div>
            <span className="text-gray-600">Thời gian dự kiến:</span>
            <span className="ml-2 font-medium">
              {schedule.route.estimated_time_min} phút
            </span>
          </div>
          <div>
            <span className="text-gray-600">Trạng thái:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRouteStatusColor(
                schedule.route.status
              )}`}
            >
              {getRouteStatusLabel(schedule.route.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Collector Info */}
      <div className="border rounded p-4">
        <div className="flex items-center gap-4 mb-3">
          <img
            src={schedule.collector.avatarUrl}
            alt={schedule.collector.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="font-semibold">{schedule.collector.name}</div>
            <div className="text-sm text-gray-600">
              ID: {schedule.collector.id}
            </div>
            <div className="text-sm text-gray-600">
              SĐT: {schedule.collector.phone}
            </div>
          </div>
          <button
            onClick={onHistoryClick}
            className="text-sm text-blue-600 hover:underline"
          >
            Xem lịch sử
          </button>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm border-t pt-3">
          <div>
            <div className="font-semibold text-green-600">
              {schedule.collector.completedRoutes || 0}
            </div>
            <div className="text-gray-600">Tuyến hoàn thành</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">
              {schedule.collector.rating}/5
            </div>
            <div className="text-gray-600">Đánh giá TB</div>
          </div>
          <div>
            <div className="font-semibold text-purple-600">
              {schedule.collector.onTimePercentage || 0}%
            </div>
            <div className="text-gray-600">Đúng giờ</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div>
        <div className="font-semibold mb-2">Bản đồ tuyến đường</div>
        <EnhancedScheduleMapView
          routeData={{
            route: schedule.route,
            urgent_points: schedule.urgentRequests || [],
            assigned_collector: schedule.collector,
          }}
          height={300}
        />
      </div>

      {/* Schedule Details */}
      <div>
        <div className="font-semibold mb-2">Chi tiết lịch trình</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày thực hiện:</span>
            <span>{new Date(schedule.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Khung giờ:</span>
            <span>
              {schedule.timeWindow?.start} - {schedule.timeWindow?.end}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loại rác:</span>
            <span>{schedule.wasteType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Yêu cầu khẩn cấp:</span>
            <span className="font-medium text-orange-600">
              {schedule.urgentRequests?.length || 0} yêu cầu
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Requests */}
      {schedule.urgentRequests && schedule.urgentRequests.length > 0 && (
        <div>
          <div className="font-semibold mb-2">Yêu cầu khẩn cấp</div>
          <div className="space-y-2">
            {schedule.urgentRequests.map((urgent) => (
              <div
                key={urgent.id}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{urgent.address}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Yêu cầu: {new Date(urgent.requested_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      Mô tả: {urgent.waste_description}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyBadgeColor(
                        urgent.urgency_level
                      )}`}
                    >
                      {getUrgencyLabel(urgent.urgency_level)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(
                        urgent.status
                      )}`}
                    >
                      {getStatusLabel(urgent.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Task 3.4: CRUD Components for Route Management

**File:** `src/components/admin/schedules/RouteEditor.tsx`

```typescript
"use client";
import { useState, useEffect } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { GoogleMapsService } from "@/lib/google-maps";

interface RouteEditorProps {
  schedule: Schedule;
  onSave: (updatedSchedule: Schedule) => void;
  onCancel: () => void;
}

export function EditTab({ schedule, onSave, onCancel }: RouteEditorProps) {
  const [routeData, setRouteData] = useState({
    name: schedule.route.name,
    code: schedule.route.code,
    active_days: schedule.route.active_days,
    time_windows: schedule.route.time_windows,
    waypoints: [],
    status: schedule.route.status,
  });

  const [waypoints, setWaypoints] = useState<google.maps.LatLng[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing route waypoints
  useEffect(() => {
    if (schedule.route.route_path) {
      const decodedPath = google.maps.geometry.encoding.decodePath(
        schedule.route.polyline
      );
      setWaypoints(decodedPath);
    }
  }, [schedule]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setWaypoints((prev) => [...prev, event.latLng!]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!routeData.name.trim()) newErrors.name = "Tên tuyến đường là bắt buộc";
    if (!routeData.code.trim()) newErrors.code = "Mã tuyến đường là bắt buộc";
    if (routeData.active_days.length === 0)
      newErrors.active_days = "Phải chọn ít nhất 1 ngày";
    if (waypoints.length < 2)
      newErrors.waypoints = "Cần ít nhất 2 điểm để tạo tuyến đường";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      const mapsService = new GoogleMapsService();
      const newRoute = await mapsService.createRoute(waypoints);

      const updatedSchedule = {
        ...schedule,
        route: {
          ...schedule.route,
          ...routeData,
          route_path: newRoute.path,
          polyline: newRoute.polyline,
          total_distance_km: newRoute.distance,
          estimated_time_min: newRoute.duration,
        },
      };

      await onSave(updatedSchedule);
    } catch (error) {
      console.error("Failed to update route:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Basic Info Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên tuyến đường *
            </label>
            <input
              type="text"
              value={routeData.name}
              onChange={(e) =>
                setRouteData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="VD: Tuyến thu gom quận 1"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mã tuyến đường *
            </label>
            <input
              type="text"
              value={routeData.code}
              onChange={(e) =>
                setRouteData((prev) => ({ ...prev, code: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="VD: Q1-R001"
            />
            {errors.code && (
              <p className="text-red-500 text-xs mt-1">{errors.code}</p>
            )}
          </div>
        </div>

        {/* Active Days */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Ngày hoạt động *
          </label>
          <div className="grid grid-cols-7 gap-2">
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day, index) => (
              <label key={day} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={routeData.active_days.includes(day)}
                  onChange={(e) => {
                    const newDays = e.target.checked
                      ? [...routeData.active_days, day]
                      : routeData.active_days.filter((d) => d !== day);
                    setRouteData((prev) => ({ ...prev, active_days: newDays }));
                  }}
                  className="rounded"
                />
                <span className="text-xs">{getDayLabel(day)}</span>
              </label>
            ))}
          </div>
          {errors.active_days && (
            <p className="text-red-500 text-xs mt-1">{errors.active_days}</p>
          )}
        </div>

        {/* Time Windows */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Khung giờ hoạt động
          </label>
          <div className="space-y-2">
            {routeData.time_windows.map((window, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={window.start}
                  onChange={(e) =>
                    updateTimeWindow(index, "start", e.target.value)
                  }
                  className="px-3 py-1 border rounded"
                />
                <span>đến</span>
                <input
                  type="time"
                  value={window.end}
                  onChange={(e) =>
                    updateTimeWindow(index, "end", e.target.value)
                  }
                  className="px-3 py-1 border rounded"
                />
                <button
                  onClick={() => removeTimeWindow(index)}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              onClick={addTimeWindow}
              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
            >
              + Thêm khung giờ
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            value={routeData.status}
            onChange={(e) =>
              setRouteData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="DRAFT">Bản nháp</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm dừng</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Route Path Editor */}
      <div>
        <h3 className="font-semibold mb-2">Chỉnh sửa đường đi</h3>
        <div className="bg-blue-50 p-3 rounded mb-4">
          <p className="text-sm text-blue-700">
            Click trên bản đồ để thêm/di chuyển các điểm dừng. Kéo thả để sắp
            xếp lại thứ tự.
          </p>
        </div>

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={waypoints[0] || { lat: 10.762622, lng: 106.660172 }}
          zoom={13}
          onClick={handleMapClick}
        >
          {/* Existing route */}
          {waypoints.length > 1 && (
            <Polyline
              path={waypoints}
              options={{
                strokeColor: "#DC2626",
                strokeWeight: 3,
                strokeOpacity: 0.7,
              }}
            />
          )}

          {/* Waypoints */}
          {waypoints.map((point, index) => (
            <Marker
              key={index}
              position={point}
              label={(index + 1).toString()}
              draggable
              onDragEnd={(e) => updateWaypoint(index, e.latLng!)}
            />
          ))}
        </GoogleMap>

        {errors.waypoints && (
          <p className="text-red-500 text-xs mt-1">{errors.waypoints}</p>
        )}

        {/* Waypoint List */}
        {waypoints.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">
              Danh sách điểm dừng ({waypoints.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {waypoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded text-sm"
                >
                  <span>
                    Điểm {index + 1}: {point.lat().toFixed(6)},{" "}
                    {point.lng().toFixed(6)}
                  </span>
                  <button
                    onClick={() => removeWaypoint(index)}
                    className="text-red-600 hover:bg-red-100 px-2 py-1 rounded"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Hủy
        </button>

        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </button>

        <button
          onClick={() => setWaypoints([])}
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Xóa toàn bộ đường đi
        </button>
      </div>
    </div>
  );
}
```

### Task 3.5: Schedule History Component

**File:** `src/components/admin/schedules/ScheduleHistory.tsx`

```typescript
"use client";
import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface HistoryTabProps {
  collectorId: string;
  routeId: string;
}

export function HistoryTab({ collectorId, routeId }: HistoryTabProps) {
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);
  const [filters, setFilters] = useState({
    dateRange: "30", // days
    status: "all",
    sortBy: "date_desc",
  });
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, [collectorId, routeId, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        collector_id: collectorId,
        route_id: routeId,
        ...filters,
      });

      const response = await fetch(`/api/admin/routes/history?${params}`);
      const data = await response.json();
      setHistory(data.items || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Bộ lọc lịch sử</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Khoảng thời gian
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
              <option value="90">3 tháng qua</option>
              <option value="365">1 năm qua</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="cancelled">Đã hủy</option>
              <option value="missed">Bỏ lỡ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sắp xếp</label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="date_desc">Mới nhất</option>
              <option value="date_asc">Cũ nhất</option>
              <option value="duration_desc">
                Thời gian thực hiện (dài nhất)
              </option>
              <option value="duration_asc">
                Thời gian thực hiện (ngắn nhất)
              </option>
              <option value="efficiency_desc">Hiệu quả cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-green-600">
            {history.filter((h) => h.status === "completed").length}
          </div>
          <div className="text-xs text-green-700">Hoàn thành</div>
        </div>
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-blue-600">
            {history.filter((h) => h.status === "in_progress").length}
          </div>
          <div className="text-xs text-blue-700">Đang thực hiện</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-yellow-600">
            {history.filter((h) => h.urgent_requests_handled > 0).length}
          </div>
          <div className="text-xs text-yellow-700">Có yêu cầu khẩn cấp</div>
        </div>
        <div className="bg-red-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-red-600">
            {
              history.filter(
                (h) => h.status === "cancelled" || h.status === "missed"
              ).length
            }
          </div>
          <div className="text-xs text-red-700">Không hoàn thành</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          Lịch sử chi tiết ({history.length} lần thực hiện)
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có lịch sử thực hiện nào được tìm thấy
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="border rounded-lg">
                {/* Summary Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                        <span className="font-medium">
                          {new Date(item.assigned_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.time_window_start} - {item.time_window_end}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {item.actual_duration && (
                          <span>Thời gian: {item.actual_duration} phút</span>
                        )}
                        {item.actual_distance && (
                          <span>Khoảng cách: {item.actual_distance}km</span>
                        )}
                        {item.urgent_requests_handled > 0 && (
                          <span className="text-orange-600">
                            {item.urgent_requests_handled} yêu cầu khẩn cấp
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.efficiency_score && (
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getEfficiencyColor(
                              item.efficiency_score
                            )}`}
                          >
                            {item.efficiency_score}%
                          </div>
                          <div className="text-xs text-gray-600">Hiệu quả</div>
                        </div>
                      )}

                      {expandedItems.has(item.id) ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedItems.has(item.id) && (
                  <div className="border-t px-4 py-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">
                          Thông tin thực hiện
                        </h4>
                        <div className="space-y-1">
                          <div>
                            Bắt đầu:{" "}
                            {item.started_at
                              ? new Date(item.started_at).toLocaleString()
                              : "Chưa bắt đầu"}
                          </div>
                          <div>
                            Kết thúc:{" "}
                            {item.completed_at
                              ? new Date(item.completed_at).toLocaleString()
                              : "Chưa kết thúc"}
                          </div>
                          <div>
                            Khoảng cách thực tế: {item.actual_distance || "N/A"}
                            km
                          </div>
                          <div>
                            Thời gian thực tế: {item.actual_duration || "N/A"}{" "}
                            phút
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Yêu cầu khẩn cấp</h4>
                        {item.urgent_requests &&
                        item.urgent_requests.length > 0 ? (
                          <div className="space-y-1">
                            {item.urgent_requests.map((urgent, index) => (
                              <div
                                key={index}
                                className="text-xs bg-white p-2 rounded border"
                              >
                                <div className="font-medium">
                                  {urgent.address}
                                </div>
                                <div className="text-gray-600">
                                  {getUrgencyLabel(urgent.urgency_level)} -{" "}
                                  {getStatusLabel(urgent.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Không có yêu cầu khẩn cấp
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {item.performance_metrics && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2">Chỉ số hiệu suất</h4>
                        <div className="grid grid-cols-4 gap-4 text-center text-xs">
                          <div>
                            <div className="font-bold text-blue-600">
                              {item.performance_metrics.on_time_percentage}%
                            </div>
                            <div className="text-gray-600">Đúng giờ</div>
                          </div>
                          <div>
                            <div className="font-bold text-green-600">
                              {item.performance_metrics.completion_rate}%
                            </div>
                            <div className="text-gray-600">Hoàn thành</div>
                          </div>
                          <div>
                            <div className="font-bold text-orange-600">
                              {item.performance_metrics.avg_response_time}m
                            </div>
                            <div className="text-gray-600">Phản hồi TB</div>
                          </div>
                          <div>
                            <div className="font-bold text-purple-600">
                              {item.performance_metrics.customer_rating}/5
                            </div>
                            <div className="text-gray-600">Đánh giá</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-1">Ghi chú</h4>
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 3.6: Collector Assignment Component

**File:** `src/components/admin/schedules/CollectorAssignment.tsx`

```typescript
'use client';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface AssignmentTabProps {
  schedule: Schedule;
  onAssign: (collectorId: string, timeWindow: TimeWindow) => void;
}

export function AssignmentTab({ schedule, onAssign }: AssignmentTabProps) {
  const [availableCollectors, setAvailableCollectors] = useState<Collector[]>([]);
  const [selectedCollector, setSelectedCollector] = useState<string>('');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<TimeWindow>({
    start: '08:00',
    end: '12:00'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    availability: 'all',
    experience: 'all',
    rating: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableCollectors();
  }, [schedule.route.id, filters]);

  const fetchAvailableCollectors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        route_id: schedule.route.id,
        date: schedule.assignedDate,
        ...filters
      });

      const response = await fetch(`/api/admin/collectors/available?${params}`);
      const data = await response.json();
      setAvailableCollectors(data.collectors || []);
    } catch (error) {
      console.error('Failed to fetch collectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollectors = availableCollectors.filter(collector =>
    collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.phone?.includes(searchTerm)
  );

  const handleAssign = async () => {
    if (!selectedCollector) return;

    try {
      await onAssign(selectedCollector, selectedTimeWindow);

      // Show success message
      alert('Phân công thành công!');
    } catch (error) {
      console.error('Failed to assign collector:', error);
      alert('Phân công thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Current Assignment */}
      {schedule.collector && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Phân công hiện tại</h3>
          <div className="flex items-center gap-4">
            <img
              src={schedule.collector.avatarUrl}
              alt={schedule.collector.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium">{schedule.collector.name}</div>
              <div className="text-sm text-gray-600">ID: {schedule.collector.id}</div>
              <div className="text-sm text-gray-600">
                Khung giờ: {schedule.timeWindow?.start} - {schedule.timeWindow?.end}
              </div>
            </div>
            <button
              onClick={() => reassignCollector()}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">
          {schedule.collector ? 'Thay đổi phân công' : 'Phân công mới'}
        </h3>

        {/* Time Window Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Khung giờ thực hiện</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bắt đầu</label>
              <input
                type="time"
                value={selectedTimeWindow.start}
                onChange={(e) => setSelectedTimeWindow(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Kết thúc</label>
              <input
                type="time"
                value={selectedTimeWindow.end}
                onChange={(e) => setSelectedTimeWindow(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Quick Time Windows */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Khung giờ mẫu</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { start: '06:00', end: '10:00', label: 'Sáng sớm' },
              { start: '08:00', end: '12:00', label: 'Sáng' },
              { start: '13:00', end: '17:00', label: 'Chiều' },
              { start: '18:00', end: '22:00', label: 'Tối' }
            ].map((window) => (
              <button
                key={window.label}
                onClick={() => setSelectedTimeWindow({ start: window.start, end: window.end })}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300"
              >
                {window.label}<br />
                <span className="text-xs text-gray-600">{window.start} - {window.end}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collector Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên theo tên, ID, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tình trạng</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">Tất cả</option>
              <option value="available">Rảnh rỗi</option>
              <option value="busy">Đang bận</option>
              <option value="preferred">Ưu tiên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kinh nghiệm</label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">Tất cả</option>
              <option value="expert">Chuyên gia (>2 năm)</option>
              <option value="experienced">Có kinh nghiệm (6-24 tháng)</option>
              <option value="beginner">Mới (0-6 tháng)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đánh giá</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">Tất cả</option>
              <option value="excellent">Xuất sắc (4.5-5.0)</option>
              <option value="good">Tốt (4.0-4.4)</option>
              <option value="average">Trung bình (3.0-3.9)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collector List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Chọn nhân viên thu gom ({filteredCollectors.length} người có sẵn)</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải danh sách nhân viên...</p>
          </div>
        ) : filteredCollectors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy nhân viên phù hợp
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCollectors.map((collector) => (
              <div
                key={collector.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCollector === collector.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCollector(collector.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={collector.avatarUrl}
                      alt={collector.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getAvailabilityIndicator(collector.availability)}`}></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{collector.name}</span>
                      <span className="text-xs text-gray-500">#{collector.id}</span>
                      {collector.isPreferred && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Ưu tiên</span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      <div>📞 {collector.phone} • 📧 {collector.email}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <span>⭐ {collector.rating}/5.0 ({collector.totalReviews} đánh giá)</span>
                        <span>🎯 {collector.completedRoutes} tuyến hoàn thành</span>
                        <span>⏱️ {collector.experienceMonths} tháng kinh nghiệm</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-medium ${getAvailabilityColor(collector.availability)}`}>
                      {getAvailabilityLabel(collector.availability)}
                    </div>
                    {collector.currentLoad && (
                      <div className="text-xs text-gray-500 mt-1">
                        Tải hiện tại: {collector.currentLoad.routes_today}/4 tuyến
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info when Selected */}
                {selectedCollector === collector.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-1">Lịch trình hôm nay</h4>
                        {collector.todaySchedule && collector.todaySchedule.length > 0 ? (
                          <div className="space-y-1">
                            {collector.todaySchedule.map((item, index) => (
                              <div key={index} className="text-xs bg-white p-2 rounded border">
                                <div>{item.route_name}</div>
                                <div className="text-gray-600">{item.time_window}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">Không có lịch trình</div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Thống kê gần đây</h4>
                        <div className="text-xs space-y-1">
                          <div>Đúng giờ: {collector.recentStats?.on_time_percentage || 0}%</div>
                          <div>Hoàn thành: {collector.recentStats?.completion_rate || 0}%</div>
                          <div>Phản hồi khẩn cấp: {collector.recentStats?.urgent_response_time || 0}m</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Button */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={handleAssign}
          disabled={!selectedCollector}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {schedule.collector ? 'Cập nhật phân công' : 'Phân công nhân viên'}
        </button>

        {schedule.collector && (
          <button
            onClick={() => removeAssignment()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Hủy phân công
          </button>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getAvailabilityIndicator(availability: string): string {
  const indicators = {
    available: 'bg-green-500',
    busy: 'bg-red-500',
    preferred: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };
  return indicators[availability] || indicators.offline;
}

function getAvailabilityColor(availability: string): string {
  const colors = {
    available: 'text-green-600',
    busy: 'text-red-600',
    preferred: 'text-yellow-600',
    offline: 'text-gray-600'
  };
  return colors[availability] || colors.offline;
}

function getAvailabilityLabel(availability: string): string {
  const labels = {
    available: 'Rảnh rỗi',
    busy: 'Đang bận',
    preferred: 'Ưu tiên',
    offline: 'Offline'
  };
  return labels[availability] || 'Không xác định';
}
```

---

## PHASE 4: Collector Interface

**File:** `src/components/dashboard/collection/map/CollectorMapView.tsx`

```typescript
"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";
import { useAuth } from "@/hooks/use-auth";

export function CollectorMapView() {
  const { user } = useAuth();
  const [routeData, setRouteData] = useState<RouteWithUrgents | null>(null);
  const [collectorLocation, setCollectorLocation] = useState<LatLng | null>(
    null
  );

  // Fetch today's route for collector
  useEffect(() => {
    async function fetchRoute() {
      if (!user?.id) return;

      const response = await fetch(
        `/api/collector/routes/today?collector_id=${user.id}`
      );
      const data = await response.json();
      setRouteData(data);
    }

    fetchRoute();
  }, [user]);

  // Track collector location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCollectorLocation(location);

        // Send location update to server
        updateLocationOnServer(location);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!routeData) {
    return <div className="p-4 text-center">Đang tải tuyến đường...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Route info header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold">{routeData.route.name}</h3>
        <div className="text-sm text-gray-600 flex gap-4">
          <span>Khoảng cách: {routeData.route.distance_km}km</span>
          <span>
            Thời gian dự kiến: {routeData.route.estimated_time_min} phút
          </span>
          <span>Yêu cầu khẩn cấp: {routeData.urgent_points.length}</span>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "60vh" }}
        center={collectorLocation || { lat: 10.762622, lng: 106.660172 }}
        zoom={15}
      >
        {/* Route path */}
        <Polyline
          path={google.maps.geometry.encoding.decodePath(
            routeData.route.polyline
          )}
          options={{
            strokeColor: "#2563eb",
            strokeWeight: 4,
            strokeOpacity: 0.6,
          }}
        />

        {/* Collector current location */}
        {collectorLocation && (
          <Marker
            position={collectorLocation}
            icon={{
              url: "/icons/collector-truck.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            title="Vị trí của bạn"
          />
        )}

        {/* Urgent request points */}
        {routeData.urgent_points.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.lat, lng: point.lng }}
            icon={{
              url: getUrgentIcon(point.urgency_level),
              scaledSize: new google.maps.Size(30, 30),
            }}
            title={point.address}
            onClick={() => openUrgentRequestDetails(point)}
          />
        ))}
      </GoogleMap>

      {/* Urgent requests list */}
      <UrgentRequestsList
        requests={routeData.urgent_points}
        onComplete={handleCompleteUrgentRequest}
      />
    </div>
  );
}
```

### Task 4.2: Urgent Requests List Component

**File:** `src/components/dashboard/collection/UrgentRequestsList.tsx`

```typescript
interface UrgentRequestsListProps {
  requests: UrgentPoint[];
  onComplete: (requestId: string) => void;
}

export function UrgentRequestsList({
  requests,
  onComplete,
}: UrgentRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-green-700">
          Không có yêu cầu khẩn cấp nào hôm nay
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Yêu cầu khẩn cấp ({requests.length})</h3>

      {requests.map((request) => (
        <div
          key={request.id}
          className={`p-4 border rounded-lg ${getUrgencyBgColor(
            request.urgency_level
          )}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="font-medium">{request.address}</div>
              <div className="text-sm text-gray-600 mt-1">
                Yêu cầu lúc: {new Date(request.requested_at).toLocaleString()}
              </div>
            </div>

            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyBadgeColor(
                request.urgency_level
              )}`}
            >
              {getUrgencyLabel(request.urgency_level)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openNavigationTo(request)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Dẫn đường
            </button>

            {request.status === "assigned" && (
              <button
                onClick={() => onComplete(request.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Hoàn thành
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## PHASE 5: Urgent Request Auto-Assignment

### Task 5.1: Auto-Assignment Service

**File:** `src/lib/urgent-assignment.ts`

```typescript
export class UrgentAssignmentService {
  async assignUrgentRequest(urgentRequestId: string): Promise<void> {
    const request = await prisma.urgentRequest.findUnique({
      where: { id: urgentRequestId },
    });

    if (!request) return;

    // Find active routes for today
    const activeRoutes = await this.getActiveRoutesToday();

    // Find nearest route that hasn't passed the point
    const bestRoute = await this.findBestRoute(request, activeRoutes);

    if (bestRoute) {
      await prisma.urgentRequest.update({
        where: { id: urgentRequestId },
        data: {
          assigned_route_id: bestRoute.route_id,
          assigned_collector_id: bestRoute.collector_id,
          assigned_at: new Date(),
          status: "ASSIGNED",
        },
      });

      // Notify collector
      await this.notifyCollector(bestRoute.collector_id, request);
    }
  }

  private async findBestRoute(
    request: UrgentRequest,
    routes: ActiveRoute[]
  ): Promise<ActiveRoute | null> {
    const googleMaps = new GoogleMapsService();

    for (const route of routes) {
      // Check if collector hasn't passed this location yet
      const hasPassedLocation = await this.hasCollectorPassedLocation(
        route.collector_id,
        { lat: request.pickup_lat, lng: request.pickup_lng }
      );

      if (!hasPassedLocation) {
        return route;
      }
    }

    // If no current route available, assign to next route
    return await this.getNextAvailableRoute();
  }

  private async hasCollectorPassedLocation(
    collectorId: string,
    location: LatLng
  ): Promise<boolean> {
    // Get collector's current location and route progress
    const currentLocation = await this.getCollectorCurrentLocation(collectorId);
    const routeProgress = await this.getRouteProgress(collectorId);

    // Logic to determine if collector has passed this point
    // Based on route sequence and current location
    return false; // Simplified
  }
}
```

### Task 5.2: API Endpoints

**File:** `src/app/api/urgent-requests/route.ts`

```typescript
// POST /api/urgent-requests
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Create urgent request
    const urgentRequest = await prisma.urgentRequest.create({
      data: {
        user_id: data.user_id,
        pickup_address: data.address,
        pickup_lat: data.lat,
        pickup_lng: data.lng,
        requested_date: new Date(),
        urgency_level: data.urgency_level,
        waste_description: data.description,
        status: "PENDING",
      },
    });

    // Auto-assign to route
    const assignmentService = new UrgentAssignmentService();
    await assignmentService.assignUrgentRequest(urgentRequest.id);

    return NextResponse.json({ success: true, id: urgentRequest.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

// GET /api/collector/routes/today
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const collectorId = searchParams.get("collector_id");

  if (!collectorId) {
    return NextResponse.json(
      { error: "Collector ID required" },
      { status: 400 }
    );
  }

  // Get today's route assignment
  const assignment = await prisma.routeAssignment.findFirst({
    where: {
      collector_id: collectorId,
      assigned_date: {
        gte: new Date().setHours(0, 0, 0, 0),
        lt: new Date().setHours(23, 59, 59, 999),
      },
    },
    include: {
      route: true,
    },
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "No route assigned today" },
      { status: 404 }
    );
  }

  // Get urgent requests for this route
  const urgentRequests = await prisma.urgentRequest.findMany({
    where: {
      assigned_route_id: assignment.route_id,
      status: { in: ["ASSIGNED", "IN_PROGRESS"] },
    },
  });

  return NextResponse.json({
    route: assignment.route,
    urgent_points: urgentRequests,
    assigned_collector: { id: collectorId },
  });
}
```

---

## PHASE 6: Real-time Tracking

### Task 6.1: Location Tracking Service

**File:** `src/lib/location-tracking.ts`

```typescript
export class LocationTrackingService {
  async updateCollectorLocation(
    collectorId: string,
    location: LatLng,
    metadata?: LocationMetadata
  ): Promise<void> {
    await prisma.collectorLocationTracking.create({
      data: {
        collector_id: collectorId,
        latitude: location.lat,
        longitude: location.lng,
        accuracy_meters: metadata?.accuracy,
        speed_kmh: metadata?.speed,
        heading_degrees: metadata?.heading,
        recorded_at: new Date(),
      },
    });

    // Update real-time dashboard via WebSocket
    await this.broadcastLocationUpdate(collectorId, location);
  }

  private async broadcastLocationUpdate(
    collectorId: string,
    location: LatLng
  ): Promise<void> {
    // WebSocket implementation for real-time updates
    // Send to admin dashboard
  }

  async getCollectorCurrentLocation(
    collectorId: string
  ): Promise<LatLng | null> {
    const latest = await prisma.collectorLocationTracking.findFirst({
      where: { collector_id: collectorId },
      orderBy: { recorded_at: "desc" },
    });

    if (!latest) return null;

    return {
      lat: Number(latest.latitude),
      lng: Number(latest.longitude),
    };
  }
}
```

---

## PHASE 7: Documentation Updates

### Task 7.1: Update Database Schema Docs

**File:** `docs/DATABASE.md`

```markdown
## Route System Schema

### Enhanced Collection Routes

The route system has been updated to support:

- Google Maps integration with polyline storage
- Urgent request auto-assignment
- Real-time collector tracking
- Route template reuse

### Key Changes:

1. `collection_routes` table stores Google Maps polyline data
2. `route_assignments` table manages daily route assignments
3. `urgent_requests` table auto-assigns to nearest available route
4. Location tracking supports real-time dashboard updates

### Route Flow:

1. Admin creates route template using Google Maps
2. Route gets assigned to collectors for specific time windows
3. Urgent requests auto-assign to active routes
4. Collectors follow route + handle urgent points
5. Real-time tracking updates admin dashboard
```

### Task 7.2: API Documentation

**File:** `docs/API_ROUTES.md`

```markdown
## Route Management APIs

### Admin APIs

- `POST /api/admin/routes` - Create new route
- `PUT /api/admin/routes/:id` - Update route
- `GET /api/admin/routes` - List all routes
- `POST /api/admin/routes/:id/assign` - Assign route to collector

### Collector APIs

- `GET /api/collector/routes/today` - Get today's route
- `POST /api/collector/location` - Update location
- `POST /api/collector/urgent/:id/complete` - Complete urgent request

### Urgent Request APIs

- `POST /api/urgent-requests` - Create urgent request (auto-assigns)
- `GET /api/urgent-requests` - List user's requests
- `PUT /api/urgent-requests/:id/status` - Update request status
```

---

## Implementation Priority

### Week 1: Database & Core Setup

- [ ] Task 1.1: Update database schema
- [ ] Task 1.2: Create route assignment table
- [ ] Task 1.3: Update urgent requests integration
- [ ] Task 2.1: Google Maps services setup
- [ ] Task 2.2: Route types definition

### Week 2: Admin Interface

- [ ] Task 3.1: Enhanced ScheduleMapView
- [ ] Task 3.2: Route creation interface
- [ ] Task 3.3: Update ScheduleSidebar
- [ ] Task 7.1: Database schema docs

### Week 3: Collector Interface

- [ ] Task 4.1: Enhanced MapView for collectors
- [ ] Task 4.2: Urgent requests list component
- [ ] Task 5.2: API endpoints
- [ ] Task 6.1: Location tracking service

### Week 4: Auto-Assignment & Polish

- [ ] Task 5.1: Auto-assignment service
- [ ] Task 7.2: API documentation
- [ ] Testing and bug fixes
- [ ] Performance optimization

## Success Metrics

- Admin can create routes using Google Maps interface
- Routes display properly with urgent request overlays
- Urgent requests auto-assign to appropriate routes
- Collectors see route + urgent points on mobile
- Basic real-time location tracking works
- System handles route reuse across multiple time windows

---

_This task plan provides a complete implementation roadmap for the routing system based on your requirements._
