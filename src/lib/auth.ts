import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export async function authenticateRequest(request: Request): Promise<AuthenticatedRequest | NextResponse> {
  const headersList = headers();
  const authorization = headersList.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    const authRequest = request.clone() as AuthenticatedRequest;
    authRequest.user = user;
    return authRequest;
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Wrapper for route handlers without params
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: Request) => {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(authResult);
  };
}

// Direct authentication for route handlers with params
export async function withAuthDirect(request: Request): Promise<AuthenticatedRequest | NextResponse> {
  return authenticateRequest(request);
} 