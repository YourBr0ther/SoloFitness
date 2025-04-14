'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ApiService } from '@/services/realApi';

interface ApiContextType {
  api: ApiService;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const api = new ApiService();

  return (
    <ApiContext.Provider value={{ api }}>
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