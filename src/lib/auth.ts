import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          level: user.level,
          currentXP: user.currentXP,
          totalXP: user.totalXP,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.level = user.level;
        token.currentXP = user.currentXP;
        token.totalXP = user.totalXP;
        token.currentStreak = user.currentStreak;
        token.longestStreak = user.longestStreak;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.username = token.username as string;
        session.user.level = token.level as number;
        session.user.currentXP = token.currentXP as number;
        session.user.totalXP = token.totalXP as number;
        session.user.currentStreak = token.currentStreak as number;
        session.user.longestStreak = token.longestStreak as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};