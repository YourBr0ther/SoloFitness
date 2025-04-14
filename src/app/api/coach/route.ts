import { NextResponse } from 'next/server';
import { withAuthDirect } from '@/lib/auth';
import { ApiService } from '@/services/realApi';

const api = new ApiService();

export async function POST(request: Request) {
  const authResult = await withAuthDirect(request);
  
  // If authResult is a NextResponse, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await api.sendMessage(authResult.user.id, message);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Coach API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 