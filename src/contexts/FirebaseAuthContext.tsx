import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firebaseAuthApi, onAdminAuthStateChanged, AdminUser } from '@/services/firebaseAuthService';

interface FirebaseAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAdminAuthStateChanged((adminUser) => {
      setUser(adminUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await firebaseAuthApi.login(email, password);
    
    if (result.success && result.data) {
      setUser(result.data.user);
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Login failed' };
  };

  const logout = async () => {
    await firebaseAuthApi.logout();
    setUser(null);
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
