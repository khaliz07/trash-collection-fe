"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RouteAssignment, AssignmentStatus } from "@/types/route-assignment";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CollectorAssignmentTableProps {
  assignments: RouteAssignment[];
  onAssignmentClick: (assignment: RouteAssignment) => void;
  onRefresh: () => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
}

export function CollectorAssignmentTable({
  assignments,
  onAssignmentClick,
  onRefresh,
  dateFilter,
  onDateFilterChange,
}: CollectorAssignmentTableProps) {
  // Auto refresh when date changes
  useEffect(() => {
    onRefresh();
  }, [dateFilter, onRefresh]);

  const getStatusText = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return "Chờ bắt đầu";
      case AssignmentStatus.IN_PROGRESS:
        return "Đang thực hiện";
      case AssignmentStatus.COMPLETED:
        return "Hoàn thành";
      case AssignmentStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return "warning" as const;
      case AssignmentStatus.IN_PROGRESS:
        return "info" as const;
      case AssignmentStatus.COMPLETED:
        return "success" as const;
      case AssignmentStatus.CANCELLED:
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  const getProgressValue = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return 0;
      case AssignmentStatus.IN_PROGRESS:
        return 50;
      case AssignmentStatus.COMPLETED:
        return 100;
      case AssignmentStatus.CANCELLED:
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Lịch trình được phân công</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="date-filter" className="text-sm font-medium">
              Ngày:
            </Label>
            <div className="relative">
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-40"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Không có lịch trình nào được phân công cho ngày này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tuyến đường</th>
                  <th className="text-left p-3 font-medium">Thời gian</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">Tiến độ</th>
                  <th className="text-left p-3 font-medium">Khoảng cách</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onAssignmentClick(assignment)}
                  >
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {assignment.route.name}
                        </span>
                        {assignment.route.description && (
                          <span className="text-sm text-gray-500">
                            {assignment.route.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(
                            assignment.assigned_date
                          ).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {assignment.time_window_start}
                          {assignment.time_window_end &&
                            ` - ${assignment.time_window_end}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusVariant(assignment.status)}>
                        {getStatusText(assignment.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={getProgressValue(assignment.status)}
                          className="w-16 h-2"
                        />
                        <span className="text-sm text-gray-600 min-w-[35px]">
                          {getProgressValue(assignment.status)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {assignment.route.total_distance_km} km
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{assignment.route.estimated_duration} phút
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
