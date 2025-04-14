import { createContext, useContext, useEffect, useState } from &apos;react';
import { useRouter } from &apos;next/navigation';
import Cookies from &apos;js-cookie';

 &apos;use client';

interface User {
  id: string;
  email: string;
  username: string;
  profile?: {
    level: number;
    xp: number;
    avatarUrl?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
      const token = Cookies.get('token');
      if (!token) {
        setLoading(false);
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          router.push('/login');
        }
        return;
      }
      
      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Clear invalid token
          Cookies.remove('token');
          setUser(null);
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        Cookies.remove('token');
        setUser(null);
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: &apos;POST',
        headers: {
          &apos;Content-Type': &apos;application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || &apos;Login failed');
      }

      Cookies.set('token', data.token, { expires: 7 });
      setUser(data.user);
      router.push('/journal');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
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