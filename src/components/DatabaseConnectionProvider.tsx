'use client';

import { useEffect, useState } from 'react';

interface DatabaseStatus {
  isChecking: boolean;
  isConnected: boolean;
  error?: string;
  lastChecked?: Date;
}

export default function DatabaseConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    isChecking: true,
    isConnected: false,
  });

  const checkDatabase = async () => {
    setDbStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const response = await fetch('/api/health');
      const health = await response.json();
      
      setDbStatus({
        isChecking: false,
        isConnected: health.database.connected,
        error: health.database.error,
        lastChecked: new Date(),
      });
    } catch (error) {
      setDbStatus({
        isChecking: false,
        isConnected: false,
        error: 'Failed to check database connection',
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkDatabase();
    
    // Check database connection every 30 seconds
    const interval = setInterval(checkDatabase, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Show connection status in development
  if (process.env.NODE_ENV === 'development' && !dbStatus.isConnected) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-primary-900/50 border border-primary-700 rounded-lg">
          <div className="text-center">
            {dbStatus.isChecking ? (
              <>
                <div className="animate-spin w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Checking Database Connection...
                </h2>
                <p className="text-gray-400 text-sm">
                  Please wait while we verify the database is available.
                </p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl">⚠</span>
                </div>
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  Database Connection Failed
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {dbStatus.error || 'Unable to connect to the database'}
                </p>
                <button
                  onClick={checkDatabase}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Retry Connection
                </button>
                <div className="mt-4 text-xs text-gray-500">
                  Last checked: {dbStatus.lastChecked?.toLocaleTimeString()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}