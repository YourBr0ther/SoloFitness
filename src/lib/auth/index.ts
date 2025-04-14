import { Platform, PLATFORMS } from '@/config/auth';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export class Auth {
  private static instance: Auth;
  private platform: Platform = PLATFORMS.WEB;

  private constructor() {}

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  setPlatform(platform: Platform) {
    this.platform = platform;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        profile: {
          select: {
            level: true,
            xp: true,
            avatarUrl: true
          }
        }
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens
    };
  }

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    if (!email || !password || !username) {
      throw new Error('Email, password, and username are required');
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile and default settings
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        profile: {
          create: {
            level: 1,
            xp: 0,
            currentStreak: 0
          }
        },
        settings: {
          create: {
            enableNotifications: true,
            darkMode: false,
            language: 'en',
            enablePenalties: true,
            enableBonuses: true,
            reminderTimes: ["09:00", "18:00"]
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        profile: {
          select: {
            level: true,
            xp: true,
            avatarUrl: true
          }
        }
      }
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: user as User,
      tokens
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          profile: {
            select: {
              level: true,
              xp: true,
              avatarUrl: true
            }
          }
        }
      });

      return user as User;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; tokenType: string };
      
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const token = jwt.sign(
      { 
        userId, 
        email,
        platform: this.platform 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Only generate refresh token for mobile/desktop platforms
    const tokens: AuthTokens = { token };
    
    if (this.platform !== PLATFORMS.WEB) {
      tokens.refreshToken = jwt.sign(
        { 
          userId,
          tokenType: 'refresh',
          platform: this.platform
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
    }

    return tokens;
  }
} 