import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { User } from '@/types/user';
import { AUTH_CONFIG } from '@/config/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: { token: string; refreshToken?: string } }> {
    // In a real app, you would hash the password and compare with stored hash
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY }
    );

    return {
      user,
      tokens: {
        token,
        refreshToken
      }
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      return user;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: AUTH_CONFIG.TOKEN_EXPIRY }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY }
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}