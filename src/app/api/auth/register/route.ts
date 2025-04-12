import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { message: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile and settings
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        profile: {
          create: {
            level: 1,
            xp: 0,
            currentStreak: 0,
            longestStreak: 0,
            exerciseCounts: {
              pushups: 0,
              situps: 0,
              squats: 0,
              milesRan: 0
            },
            // Initialize a week of streak history
            streakHistory: {
              create: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return {
                  date: date.toISOString().split('T')[0],
                  completed: false,
                  xpEarned: 0,
                  exercises: {
                    pushups: 0,
                    situps: 0,
                    squats: 0,
                    milesRan: 0
                  }
                };
              })
            },
            // Initialize some starter badges
            badges: {
              create: [
                {
                  name: "First Login",
                  description: "Logged in for the first time",
                  icon: "🏆",
                  unlocked: true,
                  progress: 1,
                  total: 1,
                  isNew: true
                },
                {
                  name: "Push-up Novice",
                  description: "Complete 100 push-ups",
                  icon: "💪",
                  unlocked: false,
                  progress: 0,
                  total: 100,
                  isNew: false
                },
                {
                  name: "Running Start",
                  description: "Run 10 miles total",
                  icon: "🏃",
                  unlocked: false,
                  progress: 0,
                  total: 10,
                  isNew: false
                },
                {
                  name: "Consistency",
                  description: "Maintain a 7-day streak",
                  icon: "🔥",
                  unlocked: false,
                  progress: 0,
                  total: 7,
                  isNew: false
                }
              ]
            }
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
        username: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 