/**
 * Supabase client configuration and initialization
 * Provides a singleton instance for database operations with enhanced error handling
 */

import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config/app';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validate required environment variables
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

/**
 * Supabase client instance with enhanced configuration
 * Used for all database operations throughout the application
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
    // Add retry logic for network issues
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Tests database connection by attempting to get current session
 * Also tests if the target table exists and is accessible
 * @returns Promise with success status and optional error message
 */
export const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session check failed:', error.message);
      return { success: false, error: error.message };
    }
    
    // Test if we can query the target table
    console.log('📋 Testing table access:', APP_CONFIG.DATABASE_TARGET_TABLE);
    const { count, error: tableError } = await supabase
      .from(APP_CONFIG.DATABASE_TARGET_TABLE)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access test failed:', tableError);
      if (tableError.code === 'PGRST116' || tableError.message.includes('does not exist')) {
        return { success: false, error: `Database table "${APP_CONFIG.DATABASE_TARGET_TABLE}" does not exist` };
      } else if (tableError.message.includes('permission denied')) {
        return { success: false, error: 'Permission denied accessing database table' };
      }
      return { success: false, error: tableError.message };
    }
    
    console.log('✅ Connection test successful, table has', count, 'records');
    return { success: true };
  } catch (err: any) {
    console.error('❌ Connection test failed:', err);
    return { 
      success: false, 
      error: err.message || 'Unknown connection error' 
    };
  }
};
/**
 * Event data type definition matching database schema
 */
export interface Event {
  /** Auto-incrementing primary key */
  id: number;
  /** Event title/name */
  event_title: string;
  /** Event date as string (not Date object) */
  date: string;
  /** Event time in PST as string (not Time object) */
  time_pst: string;
  /** Event location */
  location: string;
  /** Link to the event */
  link: string;
}