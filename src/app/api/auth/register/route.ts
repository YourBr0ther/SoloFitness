import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '@/lib/auth/index';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, username } = validation.data;
    const auth = Auth.getInstance();
    
    const result = await auth.register(email, password, username);
    if (!result) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    const { user, token, refreshToken } = result;

    // Set the refresh token in an HTTP-only cookie
    const response = NextResponse.json({ user, token }, { status: 201 });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      if (error.message === 'Email already exists') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      if (error.message === 'Username already exists') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 