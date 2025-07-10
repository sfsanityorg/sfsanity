import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { APP_CONFIG } from '../../config/app';

/**
 * Component that monitors and displays the database connection status
 * Shows connection indicator and handles retry functionality
 */
export const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tests database connectivity by performing a simple query
   * @returns Promise<boolean> - True if connection is successful
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      // Clear any previous errors
      setError(null);
      
      console.log('🔍 Testing database connection...');
      
      // Simple health check - try to get the current session
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.warn('Auth check failed:', authError.message);
        // Auth errors don't necessarily mean connection is down
        // Try a simpler check
      }
      
      // Try a basic query to test connection
      console.log('📋 Testing query on table:', APP_CONFIG.DATABASE_TARGET_TABLE);
      const { error: queryError } = await supabase
        .from(APP_CONFIG.DATABASE_TARGET_TABLE)
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      if (queryError) {
        console.error('❌ Connection test query failed:', queryError);
        if (queryError.code === 'PGRST116' || queryError.message.includes('does not exist')) {
          console.log('⚠️ Table does not exist, but connection is working');
          throw new Error(`Table "${APP_CONFIG.DATABASE_TARGET_TABLE}" does not exist`);
        }
        throw queryError;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (err: any) {
      console.error('❌ Connection check failed:', err);
      
      // Set a user-friendly error message
      if (err.message?.includes('Failed to fetch')) {
        setError('Unable to connect to database. Please check your internet connection.');
      } else if (err.message?.includes('Invalid API key')) {
        setError('Database configuration error. Please check your API keys.');
      } else if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
        setError(`Database table "${APP_CONFIG.DATABASE_TARGET_TABLE}" does not exist.`);
      } else {
        setError(`Connection error: ${err.message || 'Unknown error'}`);
      }
      
      return false;
    }
  };

  /**
   * Performs connection check and updates component state
   */
  const performConnectionCheck = async () => {
    try {
      const connected = await checkConnection();
      setIsConnected(connected);
    } catch (err) {
      console.error('Connection check error:', err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial check
    performConnectionCheck();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(performConnectionCheck, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't render anything if we haven't checked yet
  if (isConnected === null) {
    return null;
  }

  // Only show the connection status when there's an error (disconnected)
  if (isConnected) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 relative">
      <WifiOff className="w-4 h-4 text-red-500" />
      <span className="text-sm text-red-600 font-medium">Disconnected</span>
      {error && (
        <div className="flex items-center space-x-1 ml-2 group">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-600 cursor-help">
            Hover for details
          </span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-md shadow-lg z-10 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <p className="text-xs text-amber-800">{error}</p>
            <button 
              onClick={performConnectionCheck}
              className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline"
            >
              Retry connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};