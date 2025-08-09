"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  price: string;
  collectionsPerWeek: number;
  features: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: string;
    duration: number;
    price: string;
    collectionsPerWeek: number;
    features: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    isPopular: boolean;
    displayOrder: number;
  }>({
    name: '',
    description: '',
    type: 'monthly',
    duration: 1,
    price: '',
    collectionsPerWeek: 2,
    features: [''],
    status: 'ACTIVE',
    isPopular: false,
    displayOrder: 0
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      const result = await response.json();
      
      if (result.success) {
        setPackages(result.packages);
      } else {
        toast.error('Không thể tải danh sách gói dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Lỗi kết nối khi tải danh sách gói');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.filter(f => f.trim() !== '')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Tạo gói dịch vụ thành công!');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchPackages();
      } else {
        toast.error(result.error || 'Không thể tạo gói dịch vụ');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast.error('Lỗi khi tạo gói dịch vụ');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const response = await fetch(`/api/admin/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.filter(f => f.trim() !== '')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Cập nhật gói dịch vụ thành công!');
        setIsEditDialogOpen(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        toast.error(result.error || 'Không thể cập nhật gói dịch vụ');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Lỗi khi cập nhật gói dịch vụ');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return;

    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Xóa gói dịch vụ thành công!');
        fetchPackages();
      } else {
        toast.error(result.error || 'Không thể xóa gói dịch vụ');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Lỗi khi xóa gói dịch vụ');
    }
  };

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      duration: pkg.duration,
      price: pkg.price,
      collectionsPerWeek: pkg.collectionsPerWeek,
      features: pkg.features,
      status: pkg.status,
      isPopular: pkg.isPopular,
      displayOrder: pkg.displayOrder
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'monthly',
      duration: 1,
      price: '',
      collectionsPerWeek: 2,
      features: [''],
      status: 'ACTIVE',
      isPopular: false,
      displayOrder: 0
    });
  };

  const updateFeature = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  }, []);

  const addFeature = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  }, []);

  const PackageForm = useMemo(() => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Tên gói</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Tên gói dịch vụ"
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả gói dịch vụ"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Loại gói</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Hàng tháng</SelectItem>
              <SelectItem value="quarterly">Hàng quý</SelectItem>
              <SelectItem value="annual">Hàng năm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Thời hạn (tháng)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Giá (VNĐ)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="80000"
          />
        </div>

        <div>
          <Label htmlFor="collectionsPerWeek">Số lần thu gom/tuần</Label>
          <Input
            id="collectionsPerWeek"
            type="number"
            value={formData.collectionsPerWeek}
            onChange={(e) => setFormData(prev => ({ ...prev, collectionsPerWeek: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label>Tính năng</Label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              placeholder="Nhập tính năng"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => removeFeature(index)}
              disabled={formData.features.length === 1}
            >
              Xóa
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addFeature} className="mt-2">
          Thêm tính năng
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
              <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPopular"
            checked={formData.isPopular}
            onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
          />
          <Label htmlFor="isPopular">Gói phổ biến</Label>
        </div>

        <div>
          <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
          <Input
            id="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
          />
        </div>
      </div>
    </div>
  ), [formData, updateFeature, removeFeature, addFeature]);

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'default',
      INACTIVE: 'warning',
      ARCHIVED: 'error'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý gói dịch vụ</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm gói mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo gói dịch vụ mới</DialogTitle>
            </DialogHeader>
            {PackageForm}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreatePackage}>
                Tạo gói
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói dịch vụ ({packages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên gói</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Thu gom/tuần</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phổ biến</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.type}</TableCell>
                  <TableCell>{pkg.duration} tháng</TableCell>
                  <TableCell>{parseInt(pkg.price).toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>{pkg.collectionsPerWeek} lần</TableCell>
                  <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                  <TableCell>
                    {pkg.isPopular && <Badge variant="info">Phổ biến</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa gói dịch vụ</DialogTitle>
          </DialogHeader>
          {PackageForm}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdatePackage}>
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
