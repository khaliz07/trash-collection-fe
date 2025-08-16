"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { CollectorAssignmentTable } from "@/components/collector/assignments/assignment-table";
import { CollectorAssignmentDetailDialog } from "@/components/collector/assignments/assignment-detail-dialog";
import { RouteAssignment } from "@/types/route-assignment";
import { collectorAPI } from "@/apis/collector.api";
import { toast } from "sonner";
import {
  MobileDashboard,
  StatsGrid,
  StatCard,
  QuickActions,
} from "@/components/ui/mobile-dashboard";
import {
  ResponsiveMapContainer,
  MapInfoPanel,
  LocationList,
} from "@/components/ui/responsive-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  RefreshCw,
} from "lucide-react";

// Dynamic import for map to avoid SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

export default function CollectorMapPage() {
  const [selectedAssignment, setSelectedAssignment] =
    useState<RouteAssignment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const queryClient = useQueryClient();

  // Fetch assignments with React Query and aggressive caching
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collector", "assignments", { date: dateFilter }],
    queryFn: () => collectorAPI.getAssignments({ date: dateFilter }),
    select: (data) => data.assignments || [],
    staleTime: 5 * 60 * 1000, // 5 minutes - assume data is fresh for 5 minutes
    enabled: true, // Always enabled since collector needs to see their assignments
  });

  // Mutation for updating assignment status
  const updateAssignmentMutation = useMutation({
    mutationFn: collectorAPI.updateAssignment,
    onSuccess: (data) => {
      // Invalidate and refetch assignments
      queryClient.invalidateQueries({
        queryKey: ["collector", "assignments"],
      });
      toast.success("Đã cập nhật trạng thái lịch trình");
    },
    onError: (error) => {
      console.error("Error updating assignment:", error);
      toast.error("Không thể cập nhật trạng thái lịch trình");
    },
  });

  const handleAssignmentClick = (assignment: RouteAssignment) => {
    setSelectedAssignment(assignment);
    setShowDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentUpdate = (updatedAssignment: RouteAssignment) => {
    // Update the assignment in query cache
    queryClient.setQueryData(
      ["collector", "assignments", { date: dateFilter }],
      (oldData: any) => {
        if (!oldData?.assignments) return oldData;
        return {
          ...oldData,
          assignments: oldData.assignments.map((assignment: RouteAssignment) =>
            assignment.id === updatedAssignment.id
              ? updatedAssignment
              : assignment
          ),
        };
      }
    );
    toast.success("Đã cập nhật trạng thái lịch trình");
  };

  // Stats calculation
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a: any) => a.status === "completed"
  ).length;
  const pendingAssignments = assignments.filter(
    (a: any) => a.status === "pending"
  ).length;
  const completionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  // Mock location data for demonstration
  const mockLocations = assignments.map((assignment: any, index: number) => ({
    id: assignment.id,
    name: `Điểm ${index + 1}`,
    address: assignment.collection_point?.address || "Địa chỉ không xác định",
    status:
      assignment.status === "completed"
        ? "completed"
        : assignment.status === "pending"
        ? "pending"
        : "skipped",
    distance: `${(Math.random() * 5 + 0.5).toFixed(1)}km`,
    time: `${Math.floor(Math.random() * 30 + 5)} phút`,
  }));

  // Map points from assignments
  const mapPoints = assignments.map((assignment: any, index: number) => ({
    id: assignment.id,
    lat:
      assignment.collection_point?.latitude ||
      10.776889 + (Math.random() - 0.5) * 0.02,
    lng:
      assignment.collection_point?.longitude ||
      106.700806 + (Math.random() - 0.5) * 0.02,
    address:
      assignment.collection_point?.address || `Điểm thu gom ${index + 1}`,
    type: assignment.status === "completed" ? "end" : ("pickup" as const),
  }));

  // Map center (Ho Chi Minh City center)
  const mapCenter = {
    lat: 10.776889,
    lng: 106.700806,
  };

  const handleLocationSelect = (locationId: string) => {
    const assignment = assignments.find((a: any) => a.id === locationId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setShowDetailDialog(true);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const quickActions = [
    {
      label: "Làm mới",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleRefresh,
      variant: "outline" as const,
    },
    {
      label: "Vị trí của tôi",
      icon: <Navigation className="h-4 w-4" />,
      onClick: () => {
        // TODO: Implement location finding
        toast.info("Đang tìm vị trí của bạn...");
      },
      variant: "default" as const,
    },
  ];

  if (error) {
    return (
      <MobileDashboard>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4 text-center">
              Có lỗi xảy ra khi tải dữ liệu
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </MobileDashboard>
    );
  }

  if (isLoading) {
    return (
      <MobileDashboard>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Đang tải lịch trình...</p>
          </CardContent>
        </Card>
      </MobileDashboard>
    );
  }

  return (
    <MobileDashboard>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Lịch trình thu gom</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các lịch trình được phân công
        </p>
      </div>

      {/* Date Filter */}
      <div className="flex gap-3">
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard
          title="Tổng điểm"
          value={totalAssignments}
          icon={<MapPin className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Hoàn thành"
          value={completedAssignments}
          icon={<CheckCircle className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Chưa thu"
          value={pendingAssignments}
          icon={<Clock className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Tỷ lệ"
          value={`${completionRate}%`}
          icon={<Truck className="h-5 w-5" />}
          compact
        />
      </StatsGrid>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Map */}
      <ResponsiveMapContainer
        height="600px"
        className="min-h-[400px] md:min-h-[600px] max-h-[80vh]"
        showControls
        allowFullscreen
        showLocationButton
        onLocationRequest={() => toast.info("Đang tìm vị trí của bạn...")}
        onReset={handleRefresh}
      >
        <SimpleLeafletMap
          center={mapCenter}
          points={mapPoints}
          zoom={13}
          showRoute={true}
          autoFitBounds={totalAssignments > 0}
          onMarkerClick={(pointId) => {
            const assignment = assignments.find((a: any) => a.id === pointId);
            if (assignment) {
              setSelectedAssignment(assignment);
              setShowDetailDialog(true);
            }
          }}
          onRouteUpdate={(route) => {
            console.log("Route updated:", route);
          }}
        />
      </ResponsiveMapContainer>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Danh sách điểm thu gom ({totalAssignments})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationList
            locations={mockLocations}
            onLocationSelect={handleLocationSelect}
          />
        </CardContent>
      </Card>

      {/* Assignment Detail Dialog */}
      <CollectorAssignmentDetailDialog
        assignment={selectedAssignment}
        isOpen={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedAssignment(null);
        }}
      />
    </MobileDashboard>
  );
}
