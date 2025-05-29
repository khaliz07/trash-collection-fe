"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import type { UserInfo, NotificationSettings, Language, DeviceSession } from "./types";
import { mockUserInfo, mockNotificationSettings, mockLanguage, mockDevices } from "./mockData";

export interface SettingsPanelProps {
  role?: "user" | "collector" | 'admin';
}

export function SettingsPanel({ role = "user" }: SettingsPanelProps) {
  const { t } = useTranslation("common");
  // Thông tin cá nhân
  const [user, setUser] = React.useState<UserInfo>({ ...mockUserInfo });
  const [editUser, setEditUser] = React.useState(user);
  const [editMode, setEditMode] = React.useState(false);
  const [otpDialog, setOtpDialog] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  // Đổi mật khẩu
  const [pwDialog, setPwDialog] = React.useState(false);
  const [oldPw, setOldPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [pwOtp, setPwOtp] = React.useState("");
  // Cài đặt thông báo
  const [noti, setNoti] = React.useState<NotificationSettings>({ ...mockNotificationSettings });
  // Ngôn ngữ
  const [lang, setLang] = React.useState<Language>(mockLanguage);
  // Thiết bị
  const [devices, setDevices] = React.useState<DeviceSession[]>(mockDevices);
  // Xóa tài khoản
  const [delDialog, setDelDialog] = React.useState(false);
  const [delReason, setDelReason] = React.useState("");
  const [delOtp, setDelOtp] = React.useState("");

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
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }

  // Xóa tài khoản
  function handleDeleteAccount() {
    setDelDialog(true);
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t("account_settings")}</h1>
      {/* Thông tin cá nhân */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("personal_info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-lg">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.status === "active" ? t("active") : t("disabled")}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder={t("name")} value={editUser.name} disabled={!editMode} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} />
            <Input placeholder={t("phone")} value={editUser.phone} disabled={!editMode} onChange={e => setEditUser(u => ({ ...u, phone: e.target.value }))} />
            <Input placeholder={t("email")} value={editUser.email ?? ""} disabled={!editMode} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} />
            <Input placeholder={t("address")} value={editUser.address} disabled={!editMode} onChange={e => setEditUser(u => ({ ...u, address: e.target.value }))} />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          {editMode ? (
            <>
              <Button variant="default" onClick={handleSaveUser}>{t("save")}</Button>
              <Button variant="secondary" onClick={() => { setEditUser(user); setEditMode(false); }}>{t("cancel")}</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode(true)}>{t("edit")}</Button>
          )}
        </CardFooter>
      </Card>
      {/* Đổi mật khẩu */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("change_password")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="password" placeholder={t("old_password")} value={oldPw} onChange={e => setOldPw(e.target.value)} />
            <Input type="password" placeholder={t("new_password")} value={newPw} onChange={e => setNewPw(e.target.value)} />
            <Input type="password" placeholder={t("confirm_new_password")} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={handleChangePw} disabled={!oldPw || !newPw || newPw !== confirmPw}>{t("update_password")}</Button>
        </CardFooter>
      </Card>
      {/* Cài đặt thông báo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("notification_settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={noti.schedule} onCheckedChange={v => setNoti(n => ({ ...n, schedule: v }))} />
              <span>{t("receive_schedule")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={noti.policy} onCheckedChange={v => setNoti(n => ({ ...n, policy: v }))} />
              <span>{t("receive_policy")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={noti.system} onCheckedChange={v => setNoti(n => ({ ...n, system: v }))} />
              <span>{t("receive_system")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{t("notification_channel")}</span>
              <Select value={noti.channel} onValueChange={v => setNoti(n => ({ ...n, channel: v as any }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-app">{t("in_app")}</SelectItem>
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
          <CardTitle>{t("language_settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={lang} onValueChange={v => setLang(v as Language)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">{t("vietnamese")}</SelectItem>
              <SelectItem value="en">{t("english")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Thiết bị đăng nhập */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("recent_devices")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {devices.map((dev) => (
              <div key={dev.id} className="flex items-center gap-3 p-2 border rounded">
                <Badge variant={dev.current ? "primary" : "default"}>{dev.current ? t("current_device") : t("other_device")}</Badge>
                <span className="font-medium">{dev.device}</span>
                <span className="text-xs text-muted-foreground">{dev.location}</span>
                <span className="text-xs text-muted-foreground">{new Date(dev.lastActive).toLocaleString()}</span>
                {!dev.current && <Button size="sm" variant="secondary" onClick={() => handleLogoutDevice(dev.id)}>{t("logout")}</Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Xóa tài khoản */}
      <Card>
        <CardHeader>
          <CardTitle>{t("delete_account")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">{t("delete_account_desc")}</div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleDeleteAccount}>{t("delete_account")}</Button>
        </CardFooter>
      </Card>
      {/* Dialog xác thực OTP đổi số điện thoại */}
      <Dialog open={otpDialog} onOpenChange={setOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("otp_verify_phone")}</DialogTitle>
          </DialogHeader>
          <Input placeholder={t("otp_placeholder")} value={otp} onChange={e => setOtp(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setOtpDialog(false)} disabled={!otp}>{t("otp_confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog đổi mật khẩu OTP */}
      <Dialog open={pwDialog} onOpenChange={setPwDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("otp_verify_password")}</DialogTitle>
          </DialogHeader>
          <Input placeholder={t("otp_placeholder")} value={pwOtp} onChange={e => setPwOtp(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setPwDialog(false)} disabled={!pwOtp}>{t("otp_confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog xóa tài khoản */}
      <Dialog open={delDialog} onOpenChange={setDelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete_account_confirm")}</DialogTitle>
          </DialogHeader>
          <Input placeholder={t("otp_placeholder")} value={delOtp} onChange={e => setDelOtp(e.target.value)} />
          <Input placeholder={t("delete_reason_placeholder")} value={delReason} onChange={e => setDelReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={() => setDelDialog(false)} disabled={!delOtp || !delReason}>{t("delete_confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsPanel; 