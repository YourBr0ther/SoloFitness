import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user';
import { AUTH_CONFIG } from '@/config/auth';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

if (!process.env.JWT_SECRET) {
  console.error('[AuthService] JWT_SECRET environment variable is not set');
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// Helper function to convert MongoDB User to API User
function convertUser(user: any): User {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: { token: string; refreshToken: string } }> {
    console.log('[AuthService] Login attempt for email:', email);
    
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      console.log('[AuthService] User not found:', email);
      throw new Error('Invalid email or password');
    }

    console.log('[AuthService] User found, verifying password');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('[AuthService] Invalid password for user:', email);
      throw new Error('Invalid email or password');
    }

    console.log('[AuthService] Password verified, generating tokens');

    // Generate access token with user data
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.TOKEN_EXPIRY }
    );

    // Generate refresh token with minimal data
    const refreshToken = jwt.sign(
      { 
        userId: user._id.toString(),
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY }
    );

    console.log('[AuthService] Login successful for user:', email);

    return {
      user: convertUser(user),
      tokens: {
        token,
        refreshToken
      }
    };
  }

  async validateToken(token: string): Promise<User | null> {
    console.log('[AuthService] Validating token');
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        userId: string;
        type: 'access' | 'refresh';
      };
      
      console.log('[AuthService] Token decoded:', decoded);

      // Ensure it's an access token
      if (decoded.type !== 'access') {
        console.log('[AuthService] Invalid token type:', decoded.type);
        return null;
      }

      // Find the user in MongoDB
      const client = await clientPromise;
      const db = client.db('solofitness');
      const user = await db.collection('users').findOne({ 
        _id: new ObjectId(decoded.userId)
      });

      if (!user) {
        console.log('[AuthService] User not found for token:', decoded.userId);
        return null;
      }

      console.log('[AuthService] Token validation successful for user:', user.email);
      return convertUser(user);
    } catch (error) {
      console.error('[AuthService] Token validation error:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    console.log('[AuthService] Attempting to refresh token');
    try {
      // Verify and decode the refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { 
        userId: string;
        type: 'access' | 'refresh';
      };

      console.log('[AuthService] Refresh token decoded:', decoded);

      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        console.log('[AuthService] Invalid token type:', decoded.type);
        throw new Error('Invalid token type');
      }
      
      // Find the user in MongoDB
      const client = await clientPromise;
      const db = client.db('solofitness');
      const user = await db.collection('users').findOne({ 
        _id: new ObjectId(decoded.userId)
      });

      if (!user) {
        console.log('[AuthService] User not found for refresh token:', decoded.userId);
        throw new Error('User not found');
      }

      console.log('[AuthService] Generating new tokens for user:', user.email);

      // Generate new access token
      const newToken = jwt.sign(
        { 
          userId: user._id.toString(), 
          email: user.email,
          type: 'access'
        },
        JWT_SECRET,
        { expiresIn: AUTH_CONFIG.TOKEN_EXPIRY }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { 
          userId: user._id.toString(),
          type: 'refresh'
        },
        JWT_SECRET,
        { expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY }
      );

      console.log('[AuthService] Token refresh successful');

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }
}