import { NextResponse } from 'next/server';
import { getFullHealthCheck } from '@/lib/health';

export async function GET() {
  try {
    const healthCheck = await getFullHealthCheck();
    
    const status = healthCheck.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Health check failed',
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
          nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
        },
      },
      { status: 503 }
    );
  }
}