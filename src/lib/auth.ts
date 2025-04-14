import jwt from 'jsonwebtoken';
import { User } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class Auth {
  private static instance: Auth;
  private platform: string = 'web';

  private constructor() {
    console.log('[Auth] Initializing Auth instance');
  }

  static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  setPlatform(platform: string) {
    console.log('[Auth] Setting platform:', platform);
    this.platform = platform;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: { token: string; refreshToken?: string } }> {
    console.log('[Auth] Attempting login for email:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, platform: this.platform }),
      });

      console.log('[Auth] Login response status:', response.status);
      const responseData = await response.json();
      console.log('[Auth] Login response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed');
      }

      return responseData;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  }

  async validateToken(): Promise<User | null> {
    console.log('[Auth] Validating token');
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('[Auth] Validation response status:', response.status);
      
      if (!response.ok) {
        console.log('[Auth] Token validation failed');
        return null;
      }

      const userData = await response.json();
      console.log('[Auth] Validation response data:', userData);
      return userData;
    } catch (error) {
      console.error('[Auth] Token validation error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<{ token: string; refreshToken?: string }> {
    console.log('[Auth] Attempting to refresh token');
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      console.log('[Auth] Refresh response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[Auth] Token refresh failed:', error);
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      console.log('[Auth] Token refresh successful');
      return tokens;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      throw error;
    }
  }
}