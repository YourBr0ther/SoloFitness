'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { RealApiService } from '@/services/realApi';
import { mockApiService } from '@/services/mockApi';

interface ApiContextType {
  api: RealApiService | typeof mockApiService;
  isMock: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  // In development, we can use mock data. In production, use real API
  const isMock = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  const api = isMock ? mockApiService : new RealApiService();

  return (
    <ApiContext.Provider value={{ api, isMock }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
} 