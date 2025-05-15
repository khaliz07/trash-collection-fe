'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { mockUserInfo, mockNotificationSettings, mockLanguage, mockDevices, UserInfo, NotificationSettings, Language, DeviceSession } from './mockData';
import { Avatar } from '@/components/ui/avatar';

export default function UserSettingsPage() {
  // Thông tin cá nhân
  const [user, setUser] = React.useState<UserInfo>({...mockUserInfo});
  const [editUser, setEditUser] = React.useState(user);
  const [editMode, setEditMode] = React.useState(false);
  const [otpDialog, setOtpDialog] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  // Đổi mật khẩu
  const [pwDialog, setPwDialog] = React.useState(false);
  const [oldPw, setOldPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [pwOtp, setPwOtp] = React.useState('');
  // Cài đặt thông báo
  const [noti, setNoti] = React.useState<NotificationSettings>({...mockNotificationSettings});
  // Ngôn ngữ
  const [lang, setLang] = React.useState<Language>(mockLanguage);
  // Thiết bị
  const [devices, setDevices] = React.useState<DeviceSession[]>(mockDevices);
  // Xóa tài khoản
  const [delDialog, setDelDialog] = React.useState(false);
  const [delReason, setDelReason] = React.useState('');
  const [delOtp, setDelOtp] = React.useState('');

  // Cập nhật thông tin cá nhân
  function handleSaveUser() {
    setUser(editUser);
    setEditMode(false);
    if (user.phone !== editUser.phone) setOtpDialog(true);
  }

  // Đổi mật khẩu
  function handleChangePw() {
    setPwDialog(true);
  }

  // Đăng xuất thiết bị
  function handleLogoutDevice(id: string) {
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  // Xóa tài khoản
  function handleDeleteAccount() {
    setDelDialog(true);
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Cài đặt tài khoản</h1>
      {/* Thông tin cá nhân */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={user.avatarUrl} alt={user.name} size={56} />
            <div>
              <div className="font-medium text-lg">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Họ tên" value={editUser.name} disabled={!editMode} onChange={e => setEditUser(u => ({...u, name: e.target.value}))} />
            <Input label="Số điện thoại" value={editUser.phone} disabled={!editMode} onChange={e => setEditUser(u => ({...u, phone: e.target.value}))} />
            <Input label="Email" value={editUser.email ?? ''} disabled={!editMode} onChange={e => setEditUser(u => ({...u, email: e.target.value}))} />
            <Input label="Địa chỉ" value={editUser.address} disabled={!editMode} onChange={e => setEditUser(u => ({...u, address: e.target.value}))} />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          {editMode ? (
            <>
              <Button variant="default" onClick={handleSaveUser}>Lưu</Button>
              <Button variant="secondary" onClick={() => {setEditUser(user); setEditMode(false);}}>Hủy</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode(true)}>Chỉnh sửa</Button>
          )}
        </CardFooter>
      </Card>
      {/* Đổi mật khẩu */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="password" label="Mật khẩu cũ" value={oldPw} onChange={e => setOldPw(e.target.value)} />
            <Input type="password" label="Mật khẩu mới" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <Input type="password" label="Xác nhận mật khẩu mới" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={handleChangePw} disabled={!oldPw || !newPw || newPw !== confirmPw}>Đổi mật khẩu</Button>
        </CardFooter>
      </Card>
      {/* Cài đặt thông báo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={noti.schedule} onCheckedChange={v => setNoti(n => ({...n, schedule: v}))} />
              <span>Nhận thông báo lịch thu gom</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={noti.policy} onCheckedChange={v => setNoti(n => ({...n, policy: v}))} />
              <span>Nhận thông báo chính sách</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={noti.system} onCheckedChange={v => setNoti(n => ({...n, system: v}))} />
              <span>Nhận thông báo hệ thống</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Kênh nhận thông báo:</span>
              <Select value={noti.channel} onValueChange={v => setNoti(n => ({...n, channel: v as any}))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-app">Trong ứng dụng</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Ngôn ngữ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cài đặt ngôn ngữ</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={lang} onValueChange={v => setLang(v as Language)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Thiết bị đăng nhập */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thiết bị đăng nhập gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {devices.map(dev => (
              <div key={dev.id} className="flex items-center gap-3 p-2 border rounded">
                <Badge variant={dev.current ? 'primary' : 'default'}>{dev.current ? 'Thiết bị hiện tại' : 'Thiết bị khác'}</Badge>
                <span className="font-medium">{dev.device}</span>
                <span className="text-xs text-muted-foreground">{dev.location}</span>
                <span className="text-xs text-muted-foreground">{new Date(dev.lastActive).toLocaleString()}</span>
                {!dev.current && <Button size="sm" variant="secondary" onClick={() => handleLogoutDevice(dev.id)}>Đăng xuất</Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Xóa tài khoản */}
      <Card>
        <CardHeader>
          <CardTitle>Xóa tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">Sau khi xóa, tài khoản sẽ bị vô hiệu hóa và không thể khôi phục. Vui lòng xác nhận OTP và lý do xóa.</div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleDeleteAccount}>Xóa tài khoản</Button>
        </CardFooter>
      </Card>
      {/* Dialog xác thực OTP đổi số điện thoại */}
      <Dialog open={otpDialog} onOpenChange={setOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác thực số điện thoại mới</DialogTitle>
          </DialogHeader>
          <Input placeholder="Nhập mã OTP" value={otp} onChange={e => setOtp(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setOtpDialog(false)} disabled={!otp}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog đổi mật khẩu OTP */}
      <Dialog open={pwDialog} onOpenChange={setPwDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác thực đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <Input placeholder="Nhập mã OTP" value={pwOtp} onChange={e => setPwOtp(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setPwDialog(false)} disabled={!pwOtp}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog xóa tài khoản */}
      <Dialog open={delDialog} onOpenChange={setDelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
          </DialogHeader>
          <Input placeholder="Nhập mã OTP" value={delOtp} onChange={e => setDelOtp(e.target.value)} />
          <Input placeholder="Lý do xóa tài khoản" value={delReason} onChange={e => setDelReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={() => setDelDialog(false)} disabled={!delOtp || !delReason}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 