'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

type UserRole = 'USER' | 'COLLECTOR' | 'ADMIN';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Map path patterns to required roles
const getRequiredRoleFromPath = (pathname: string): UserRole | null => {
  if (pathname.startsWith('/dashboard/admin')) {
    return 'ADMIN';
  }
  if (pathname.startsWith('/dashboard/collector')) {
    return 'COLLECTOR';
  }
  if (pathname.startsWith('/dashboard/user')) {
    return 'USER';
  }
  // For other dashboard paths, allow any authenticated user
  if (pathname.startsWith('/dashboard')) {
    return null; // Will check authentication but not specific role
  }
  return null;
};

// Get redirect path based on user role
const getRedirectPath = (userRole: UserRole): string => {
  switch (userRole) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'COLLECTOR':
      return '/dashboard/collector';
    case 'USER':
      return '/dashboard/user';
    default:
      return '/';
  }
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const requiredRole = getRequiredRoleFromPath(pathname);
    
    // If this path doesn't require authentication, allow access
    if (!requiredRole && !pathname.startsWith('/dashboard')) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      router.push('/login');
      return;
    }

    // If path requires authentication but no specific role, allow access
    if (!requiredRole) {
      return;
    }

    // Check if user has required role
    if (user.role !== requiredRole) {
      toast.error('Bạn không có quyền truy cập trang này');
      const correctPath = getRedirectPath(user.role);
      router.push(correctPath);
      return;
    }
  }, [isAuthenticated, user, pathname, router]);

  // For protected paths, don't render until auth is checked
  const requiredRole = getRequiredRoleFromPath(pathname);
  
  if (requiredRole || pathname.startsWith('/dashboard')) {
    // If not authenticated, don't render anything
    if (!isAuthenticated || !user) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>;
    }

    // If has specific role requirement but user doesn't have it, don't render
    if (requiredRole && user.role !== requiredRole) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>;
    }
  }

  return <>{children}</>;
}
