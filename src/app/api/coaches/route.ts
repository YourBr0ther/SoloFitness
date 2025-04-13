import { NextResponse } from 'next/server';
import { withAuthDirect } from '@/lib/auth';
import { COACHES } from '@/data/coaches';

// GET /api/coaches - Get all coaches
export async function GET(request: Request) {
  const authResult = await withAuthDirect(request);
  
  // If authResult is a NextResponse, it means authentication failed
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    return NextResponse.json({ coaches: COACHES });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
} 