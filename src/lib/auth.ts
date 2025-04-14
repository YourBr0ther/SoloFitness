import jwt from 'jsonwebtoken';
import { User } from '@/types/user';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class Auth {
  private static instance: Auth;
  private platform: string = 'web';

  private constructor() {}

  static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  setPlatform(platform: string) {
    this.platform = platform;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: { token: string; refreshToken?: string } }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, platform: this.platform }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }
}