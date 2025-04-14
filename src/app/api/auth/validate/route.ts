import { NextResponse } from &apos;next/server';
import { prisma } from '@/lib/prisma';
import jwt from &apos;jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || &apos;your-secret-key';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: &apos;No token provided&apos; }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: {
            select: {
              level: true,
              xp: true,
              avatarUrl: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ message: &apos;User not found&apos; }, { status: 404 });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        user: userWithoutPassword
      });
    } catch (error) {
      return NextResponse.json({ message: &apos;Invalid token&apos; }, { status: 401 });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { message: &apos;Internal server error&apos; },
      { status: 500 }
    );
  }
} 