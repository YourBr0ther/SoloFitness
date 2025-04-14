import { NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies
  response.cookies.delete(AUTH_CONFIG.TOKEN_STORAGE_KEY);
  response.cookies.delete(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  
  return response;
} 