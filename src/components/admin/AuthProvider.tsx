"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "登录失败" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "网络错误" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
        credentials: "include",
      });
      setUser(null);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 权限检查钩子
export function usePermission(requiredPermission: string) {
  const { user, isLoading } = useAuth();

  const hasPermission = () => {
    if (!user) return false;
    // super_admin 拥有所有权限
    if (user.role === "super_admin") return true;
    // 检查用户权限列表
    return user.permissions.includes(requiredPermission);
  };

  return {
    hasPermission: hasPermission(),
    isLoading,
    user,
  };
}

// 角色检查钩子
export function useRole(requiredRoles: string[]) {
  const { user, isLoading } = useAuth();

  const hasRole = () => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    hasRole: hasRole(),
    isLoading,
    user,
  };
}

// 权限守卫组件
interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, requiredPermission, fallback = null }: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission(requiredPermission);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 角色守卫组件
interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRoles, fallback = null }: RoleGuardProps) {
  const { hasRole, isLoading } = useRole(requiredRoles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
