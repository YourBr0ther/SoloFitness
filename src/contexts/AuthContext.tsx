'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get(AUTH_CONFIG.TOKEN_STORAGE_KEY) || localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      if (!token) {
        setLoading(false);
        if (!window.location.pathname.includes('/login')) {
          router.push('/login');
        }
        return;
      }
      
      try {
        const validatedUser = await auth.validateToken(token);
        
        if (validatedUser) {
          setUser(validatedUser);
        } else {
          // Try to refresh token if available
          const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
          if (refreshToken) {
            try {
              const tokens = await auth.refreshToken(refreshToken);
              
              // Store new tokens
              if (typeof window !== 'undefined') {
                Cookies.set(AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.token);
                localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.token);
                if (tokens.refreshToken) {
                  localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
                }
              }

              // Validate new token
              const refreshedUser = await auth.validateToken(tokens.token);
              if (refreshedUser) {
                setUser(refreshedUser);
                return;
              }
            } catch (error) {
              console.error('Token refresh error:', error);
            }
          }

          // Clear invalid tokens
          Cookies.remove(AUTH_CONFIG.TOKEN_STORAGE_KEY);
          localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
          localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
          setUser(null);
          if (!window.location.pathname.includes('/login')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        Cookies.remove(AUTH_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
        setUser(null);
        if (!window.location.pathname.includes('/login')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string, platform: Platform = PLATFORMS.WEB) => {
    try {
      auth.setPlatform(platform);
      const { user: authUser, tokens } = await auth.login(email, password);

      // Store tokens based on platform
      if (platform === PLATFORMS.WEB) {
        Cookies.set(AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.token, { expires: 7 });
      }
      localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.token);
      
      if (tokens.refreshToken) {
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
      }

      setUser(authUser);
      router.push('/journal');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
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