import { Platform, PLATFORMS } from '@/config/auth';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

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
  platform: string;

  private constructor(platform: string = 'web') {
    this.platform = platform;
    console.log('[Auth] Initializing Auth instance');
  }

  static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  setPlatform(platform: Platform) {
    this.platform = platform;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string } | null> {
    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ email });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const userResponse: User = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      profile: user.profile,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const token = this.generateToken(userResponse);
    const refreshToken = this.generateRefreshToken(userResponse);

    return { user: userResponse, token, refreshToken };
  }

  async register(email: string, password: string, username: string): Promise<{ user: User; token: string; refreshToken: string } | null> {
    const client = await clientPromise;
    const db = client.db();

    // Check for existing email or username
    const existingUser = await db.collection('users').findOne({
      $or: [
        { email },
        { username }
      ]
    });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const defaultProfile = {
      level: 1,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: [],
      exerciseCounts: {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      }
    };

    const defaultSettings = {
      enableNotifications: true,
      darkMode: false,
      language: 'en',
      enablePenalties: true,
      enableBonuses: true,
      reminderTimes: []
    };

    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      username,
      profile: defaultProfile,
      settings: defaultSettings,
      createdAt: now,
      updatedAt: now
    });

    const userResponse: User = {
      id: result.insertedId.toString(),
      email,
      username,
      profile: defaultProfile,
      settings: defaultSettings,
      createdAt: now,
      updatedAt: now
    };

    const token = this.generateToken(userResponse);
    const refreshToken = this.generateRefreshToken(userResponse);

    return { user: userResponse, token, refreshToken };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const client = await clientPromise;
      const db = client.db();
      
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
      if (!user) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        profile: user.profile,
        settings: user.settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
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

      const client = await clientPromise;
      const db = client.db('solofitness');
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(decoded.userId) },
        { 
          projection: {
            _id: 1,
            email: 1
          }
        }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user._id.toString(), user.email);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, platform: this.platform },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, platform: this.platform },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const token = jwt.sign(
      { 
        userId, 
        email,
        type: 'access',
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
          type: 'refresh',
          platform: this.platform
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
    }

    return tokens;
  }
} 