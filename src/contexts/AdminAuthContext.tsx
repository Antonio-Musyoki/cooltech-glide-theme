import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuthApi, AdminUser } from '@/services/adminService';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingUser = adminAuthApi.getSession();
    if (existingUser && adminAuthApi.isAuthenticated()) {
      setUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await adminAuthApi.login(username, password);
    
    if (result.success && result.data) {
      setUser(result.data.user);
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Login failed' };
  };

  const logout = () => {
    adminAuthApi.logout();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
