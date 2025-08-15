"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Route {
  id: string;
  name: string;
  description?: string;
  estimated_duration: number;
  total_distance_km?: string | number;
}

interface Collector {
  id: string;
  name: string;
  email: string;
  phone?: string;
  licensePlate?: string;
  rating: number;
}

interface AssignmentFilters {
  date: string;
  route_id: string;
  collector_id: string;
}

interface AssignmentFilterBarProps {
  routes: Route[];
  collectors: Collector[];
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
}

export function AssignmentFilterBar({
  routes,
  collectors,
  filters,
  onFiltersChange,
}: AssignmentFilterBarProps) {
  const [localFilters, setLocalFilters] = useState<AssignmentFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleFilterChange = (key: keyof AssignmentFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters: AssignmentFilters = {
      date: getTodayDate(),
      route_id: "all",
      collector_id: "all",
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-filter" className="text-sm font-medium">
                Ngày thực hiện
              </Label>
              <div className="relative">
                <Input
                  id="date-filter"
                  type="date"
                  value={localFilters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Route Filter */}
            <div className="space-y-2">
              <Label htmlFor="route-filter" className="text-sm font-medium">
                Tuyến đường
              </Label>
              <Select
                value={localFilters.route_id}
                onValueChange={(value) => handleFilterChange("route_id", value)}
              >
                <SelectTrigger id="route-filter">
                  <SelectValue placeholder="Chọn tuyến đường" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tuyến đường</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{route.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {route.estimated_duration} phút •{" "}
                          {route.total_distance_km} km
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collector Filter */}
            <div className="space-y-2">
              <Label htmlFor="collector-filter" className="text-sm font-medium">
                Nhân viên thu gom
              </Label>
              <Select
                value={localFilters.collector_id}
                onValueChange={(value) =>
                  handleFilterChange("collector_id", value)
                }
              >
                <SelectTrigger id="collector-filter">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân viên</SelectItem>
                  {collectors.map((collector) => (
                    <SelectItem key={collector.id} value={collector.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{collector.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {collector.phone} •{" "}
                          {collector.licensePlate || "Chưa có biển số"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="whitespace-nowrap"
            >
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Hiển thị:</span>
          <span className="font-medium">
            {localFilters.date === getTodayDate()
              ? "Hôm nay"
              : localFilters.date}
          </span>
          {localFilters.route_id !== "all" && (
            <>
              <span>•</span>
              <span className="font-medium">
                {routes.find((r) => r.id === localFilters.route_id)?.name ||
                  "Tuyến đường"}
              </span>
            </>
          )}
          {localFilters.collector_id !== "all" && (
            <>
              <span>•</span>
              <span className="font-medium">
                {collectors.find((c) => c.id === localFilters.collector_id)
                  ?.name || "Nhân viên"}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
