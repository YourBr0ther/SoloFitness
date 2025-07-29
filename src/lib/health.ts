import { prisma } from './prisma';

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    responseTime?: number;
    error?: string;
  };
  environment: {
    nodeEnv: string;
    databaseUrl: string;
    nextAuthUrl: string;
  };
}

export async function checkDatabaseHealth(): Promise<HealthCheck['database']> {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      connected: true,
      responseTime,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

export async function getFullHealthCheck(): Promise<HealthCheck> {
  const database = await checkDatabaseHealth();
  
  return {
    status: database.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
    },
  };
}

export async function waitForDatabase(maxAttempts: number = 10, delayMs: number = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Database connection attempt ${attempt}/${maxAttempts}...`);
    
    const health = await checkDatabaseHealth();
    
    if (health.connected) {
      console.log('✅ Database connected successfully');
      return true;
    }
    
    console.log(`❌ Database connection failed: ${health.error}`);
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('💥 Database connection failed after all attempts');
  return false;
}