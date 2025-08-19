"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Loader2, Weight, MapPin, Calendar, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrashWeightStats {
  administrativeArea: string;
  areaType: "province" | "district" | "ward";
  totalWeight: number;
  timePeriod: string;
  assignmentCount: number;
}

interface TrashWeightSummary {
  totalAssignments: number;
  totalWeightRecorded: number;
  administrativeAreas: number;
  timePeriods: number;
}

interface TrashWeightResponse {
  data: TrashWeightStats[];
  summary: TrashWeightSummary;
}

interface AdministrativeArea {
  code: string;
  name: string;
  full_name?: string;
  code_name?: string;
}

export function TrashWeightReports() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrashWeightStats[]>([]);
  const [summary, setSummary] = useState<TrashWeightSummary | null>(null);

  // Filter states
  const [provinces, setProvinces] = useState<AdministrativeArea[]>([]);
  const [districts, setDistricts] = useState<AdministrativeArea[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [groupTime, setGroupTime] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch("/api/address/provinces");
        const provincesData = await response.json();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedProvince || selectedProvince === "all") {
        setDistricts([]);
        setSelectedDistrict("all");
        return;
      }

      try {
        const response = await fetch(
          `/api/address/districts/${selectedProvince}`
        );
        const districtsData = await response.json();
        setDistricts(districtsData);
        setSelectedDistrict("all"); // Reset district selection
      } catch (error) {
        console.error("Error loading districts:", error);
      }
    };

    loadDistricts();
  }, [selectedProvince]);

  // Fetch trash weight data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        groupTime,
      });

      if (selectedProvince && selectedProvince !== "all")
        params.append("provinceId", selectedProvince);
      if (selectedDistrict && selectedDistrict !== "all")
        params.append("districtId", selectedDistrict);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const response = await fetch(`/api/admin/reports/trash-weight?${params}`);
      const result: TrashWeightResponse = await response.json();

      setData(result.data);
      setSummary(result.summary);
    } catch (error) {
      console.error("Error fetching trash weight data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    // Group data by time period and administrative area
    const groupedByTime: { [timePeriod: string]: { [area: string]: number } } =
      {};
    const allAreas = new Set<string>();

    data.forEach((item) => {
      if (!groupedByTime[item.timePeriod]) {
        groupedByTime[item.timePeriod] = {};
      }
      groupedByTime[item.timePeriod][item.administrativeArea] =
        item.totalWeight;
      allAreas.add(item.administrativeArea);
    });

    // Convert to chart format
    return Object.entries(groupedByTime)
      .map(([timePeriod, areas]) => ({
        timePeriod,
        ...areas,
      }))
      .sort((a, b) => a.timePeriod.localeCompare(b.timePeriod));
  }, [data]);

  // Get unique areas for bar colors
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.administrativeArea)));
  }, [data]);

  // Generate colors for bars
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#0088fe",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#8dd1e1",
  ];

  const getAreaTypeLabel = () => {
    if (selectedDistrict && selectedDistrict !== "all") return "Phường/Xã";
    if (selectedProvince && selectedProvince !== "all") return "Quận/Huyện";
    return "Tỉnh/Thành phố";
  };

  const getTimeLabel = () => {
    switch (groupTime) {
      case "day":
        return "ngày";
      case "week":
        return "tuần";
      case "month":
        return "tháng";
      case "year":
        return "năm";
      default:
        return "thời gian";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Bộ lọc thống kê
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Province Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tỉnh/Thành phố</label>
              <Select
                value={selectedProvince}
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.code} value={province.code}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quận/Huyện</label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={!selectedProvince || selectedProvince === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Group Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nhóm theo thời gian</label>
              <Select
                value={groupTime}
                onValueChange={(value: any) => setGroupTime(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Filters Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={fetchData} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <DatePicker
                date={startDate}
                onSelect={setStartDate}
                placeholder="Chọn ngày bắt đầu"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <DatePicker
                date={endDate}
                onSelect={setEndDate}
                placeholder="Chọn ngày kết thúc"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Weight className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng khối lượng rác
                </p>
                <p className="text-2xl font-bold">
                  {summary.totalWeightRecorded.toFixed(1)} kg
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Số lượt thu gom
                </p>
                <p className="text-2xl font-bold">{summary.totalAssignments}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Khu vực hoạt động
                </p>
                <p className="text-2xl font-bold">
                  {summary.administrativeAreas}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Chu kỳ thời gian
                </p>
                <p className="text-2xl font-bold">{summary.timePeriods}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Biểu đồ khối lượng rác theo {getAreaTypeLabel()} và {getTimeLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timePeriod"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "Khối lượng (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)} kg`,
                    name, // This will show the area name (địa chỉ)
                  ]}
                  labelFormatter={(label) => `${getTimeLabel()}: ${label}`}
                />
                {uniqueAreas.map((area, index) => (
                  <Bar
                    key={area}
                    dataKey={area}
                    fill={colors[index % colors.length]}
                    name={area}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Không có dữ liệu để hiển thị
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết dữ liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Khu vực</th>
                    <th className="px-4 py-2 text-left">Thời gian</th>
                    <th className="px-4 py-2 text-right">
                      Khối lượng rác (kg)
                    </th>
                    <th className="px-4 py-2 text-right">Số lượt thu gom</th>
                    <th className="px-4 py-2 text-right">
                      Trung bình (kg/lượt)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 font-medium">
                        {item.administrativeArea}
                      </td>
                      <td className="px-4 py-2">{item.timePeriod}</td>
                      <td className="px-4 py-2 text-right">
                        {item.totalWeight.toFixed(1)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {item.assignmentCount}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {(item.totalWeight / item.assignmentCount).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
