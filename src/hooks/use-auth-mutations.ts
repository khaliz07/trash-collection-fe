import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/apis/auth.api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Login mutation
export const useLogin = () => {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success("Đăng nhập thành công!");

      // Redirect based on role
      if (data.user.role === "user") {
        router.push("/dashboard/user");
      } else if (data.user.role === "collector") {
        router.push("/dashboard/collector");
      } else {
        router.push("/dashboard/admin");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success("Đăng ký thành công!");
      router.push("/dashboard/user"); // New users are always 'user' role
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      toast.success("Đăng xuất thành công!");
      router.push("/");
    },
    onError: (error: any) => {
      // Even if API call fails, we should logout locally
      logout();
      queryClient.clear();
      router.push("/");
      const message = error.response?.data?.message || "Đã đăng xuất";
      toast.info(message);
    },
  });
};

// Get current user query
export const useMe = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authAPI.me,
    enabled: !!token,
    retry: false,
  });
};

// Update user location mutation
export const useUpdateUserLocation = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      address: string;
      latitude: number;
      longitude: number;
    }) => authAPI.updateLocation(data),
    onSuccess: (response) => {
      // Update user in auth state
      updateUser(response.data);

      // Invalidate queries that depend on user data
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      toast({
        title: "Cập nhật thành công",
        description: "Vị trí của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi cập nhật vị trí";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
