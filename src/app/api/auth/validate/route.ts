import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.server';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    const auth = AuthService.getInstance();
    const user = await auth.validateToken(token);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}