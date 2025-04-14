'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AUTH_CONFIG, PLATFORMS, Platform } from '@/config/auth';
import { Auth } from '@/lib/auth';
import { User } from '@/types/user';

const auth = Auth.getInstance();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, platform?: Platform) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const validatedUser = await auth.validateToken();
        setUser(validatedUser);

        // Only redirect if we're on a protected route and not authenticated
        if (!validatedUser && !pathname?.includes('/login') && !pathname?.includes('/register')) {
          const protectedRoutes = ['/coach', '/journal', '/profile'];
          if (protectedRoutes.some(route => pathname?.startsWith(route))) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const login = async (email: string, password: string, platform: Platform = PLATFORMS.WEB) => {
    try {
      setLoading(true);
      auth.setPlatform(platform);
      const response = await auth.login(email, password);
      setUser(response.user);
      router.push('/journal');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00A8FF]"></div>
        </div>
      ) : (
        children
      )}
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