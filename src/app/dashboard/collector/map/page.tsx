"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectorAssignmentTable } from "@/components/collector/assignments/assignment-table";
import { CollectorAssignmentDetailDialog } from "@/components/collector/assignments/assignment-detail-dialog";
import { RouteAssignment } from "@/types/route-assignment";
import { collectorAPI } from "@/apis/collector.api";
import { toast } from "sonner";

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

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải lịch trình...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Lịch trình thu gom của tôi</h1>
        <p className="text-gray-600">
          Xem và quản lý các lịch trình được phân công cho bạn
        </p>
      </div>

      <CollectorAssignmentTable
        assignments={assignments}
        onAssignmentClick={handleAssignmentClick}
        onRefresh={handleRefresh}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <CollectorAssignmentDetailDialog
        assignment={selectedAssignment}
        isOpen={showDetailDialog}
        onClose={handleCloseDialog}
        onUpdate={handleAssignmentUpdate}
      />
    </div>
  );
}
