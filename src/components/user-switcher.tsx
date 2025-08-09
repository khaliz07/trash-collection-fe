"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserSwitcherProps {
  onUserChange?: (userId: string) => void;
}

// Demo users for testing
const demoUsers = [
  { id: "user-1", name: "Nguyễn Văn An", email: "an.nguyen@example.com" },
  { id: "user-2", name: "Trần Thị Bích", email: "bich.tran@example.com" },
  { id: "user-3", name: "Lê Quang Dũng", email: "dung.le@example.com" },
  { id: "admin-1", name: "Admin User", email: "admin@ecocollect.com" },
];

export function UserSwitcher({ onUserChange }: UserSwitcherProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("user-1");
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Set initial user in localStorage
    const savedUserId = localStorage.getItem("demo-user-id");
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    } else {
      localStorage.setItem("demo-user-id", "user-1");
    }
  }, []);

  const handleUserChange = async (userId: string) => {
    setIsChanging(true);
    setCurrentUserId(userId);

    // Save to localStorage for persistence
    localStorage.setItem("demo-user-id", userId);

    // Update the global API request headers
    window.localStorage.setItem("x-user-id", userId);

    // Call the callback if provided
    if (onUserChange) {
      onUserChange(userId);
    }

    // Refresh the page to reload data with new user
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const currentUser =
    demoUsers.find((user) => user.id === currentUserId) || demoUsers[0];

  return (
    <Card className="mb-6 border-2 border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          Demo User Switcher (Chuyển đổi người dùng)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              value={currentUserId}
              onValueChange={handleUserChange}
              disabled={isChanging}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {demoUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isChanging && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang chuyển đổi...
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-orange-600">
          💡 Chọn user khác để thấy dữ liệu riêng biệt cho từng người dùng
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to get current user ID for API calls
export function useCurrentUser() {
  const [userId, setUserId] = useState<string>("user-1");

  useEffect(() => {
    const savedUserId = localStorage.getItem("demo-user-id") || "user-1";
    setUserId(savedUserId);
  }, []);

  return userId;
}
