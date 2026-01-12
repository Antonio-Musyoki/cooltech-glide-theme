import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'manager';
}

interface AuthContextType {
  user: AdminUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchAdminProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin profile:', error);
        setUser(null);
      } else if (data) {
        setUser({
          id: data.id,
          email: data.email,
          username: data.username || data.email.split('@')[0],
          role: (data.role as 'admin' | 'manager') || 'admin',
        });
      } else {
        // User exists but no admin profile - they're not an admin
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Login failed';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address';
        } else {
          errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          return { success: false, error: 'You do not have admin access' };
        }

        setUser({
          id: adminData.id,
          email: adminData.email,
          username: adminData.username || adminData.email.split('@')[0],
          role: (adminData.role as 'admin' | 'manager') || 'admin',
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
