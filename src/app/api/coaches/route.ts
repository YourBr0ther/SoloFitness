import { NextResponse } from 'next/server';
import { withAuthDirect } from '@/lib/auth';
import { ApiService } from '@/services/realApi';

const api = new ApiService();

// GET /api/coaches - Get all coaches
export async function GET(request: Request) {
  const authResult = await withAuthDirect(request);
  
  // If authResult is a NextResponse, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const response = await api.getCoaches();
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
} 