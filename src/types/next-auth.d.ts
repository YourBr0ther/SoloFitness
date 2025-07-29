import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      level: number;
      currentXP: number;
      totalXP: number;
      currentStreak: number;
      longestStreak: number;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    level: number;
    currentXP: number;
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string;
    level: number;
    currentXP: number;
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
  }
}